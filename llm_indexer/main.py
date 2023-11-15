from typing import Union
from fastapi import FastAPI
import os
from llama_index import QuestionAnswerPrompt,  SimpleDirectoryReader, SimpleWebPageReader, SummaryIndex, TreeIndex
from llama_hub.web.sitemap.base import SitemapReader
from pathlib import Path
from llama_index import download_loader, ServiceContext
from llama_index.prompts import PromptTemplate
from llama_index.llms import OpenAI

app = FastAPI()
loader = SitemapReader()

llm = OpenAI(temperature=0.1, model="gpt-3.5-turbo")
service_context = ServiceContext.from_defaults(llm=llm)

MarkdownReader = download_loader("MarkdownReader")
loader = MarkdownReader()

template = (
    "We have provided knowledge below. \n"
    "---------------------\n"
    "{context_str}"
    "\n---------------------\n"
    "Given the provided knowledge and not prior knowledge,"
    "answer the query, including the commands and the documentation URL,\n"
    "the answer should only contain accurate information from provided knowledge only\n"
    "If no answer, ask to visit the main blog and documentation website\n"
    "The query is: {query_str}\n"
)
qa_template = PromptTemplate(template)

# docsUrls = [
#   "https://docs.fleek.network/docs/node/install/",
#   "https://docs.fleek.network/docs/node/health-check/",
#   "https://docs.fleek.network/docs/node/testnet-onboarding/",
#   "https://docs.fleek.network/docs/node/requirements/",
#   "https://docs.fleek.network/docs/whitepaper/",
#   "https://docs.fleek.network/references/Lightning%20CLI/uninstall-lightning-node/",
#   "https://docs.fleek.network/references/Lightning%20CLI/update-cli-from-source-code/",
# ]

docsUrls = [
  "https://docs.fleek.network/docs/node/install"
]

@app.get("/ping")
def read_root():
  return "pong"

@app.get("/query")
def query(question: Union[str, None] = None):
  # documents = SimpleWebPageReader(html_to_text=True).load_data(docsUrls)
  # documents = loader.load_data(sitemap_url='https://docs.fleek.network/sitemap.xml')
  documents = loader.load_data(file=Path("./knowledge.md"))

  index = SummaryIndex.from_documents(documents, service_context=service_context)
  # index = TreeIndex.from_documents(documents)

  query_engine = index.as_query_engine()
  query_engine.update_prompts(
    {"response_synthesizer:text_qa_template": qa_template}
  )

  answer = query_engine.query(question)

  print("[debug] node.metadata:")
  print(answer.source_nodes[0].node.metadata)

  print(answer)

  # return answer
  return { "answer": str(answer )}

