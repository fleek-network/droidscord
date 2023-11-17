from fastapi import FastAPI
from llama_index import SummaryIndex
from llama_hub.web.sitemap.base import SitemapReader
from pathlib import Path
from llama_index import download_loader, ServiceContext
from llama_index.prompts import PromptTemplate
from llama_index.llms import OpenAI
import os

app = FastAPI()
loader = SitemapReader()

llm = OpenAI(temperature=0.1, model=os.getenv('LLM_MODEL', 'gpt-3.5-turbo'))
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

@app.get("/ping")
def read_root():
  return "pong"

@app.get("/query")
def query(question: str):
  # The document is load on request
  # to allows to quickly deploy changes
  # as otherwise, would have to restart
  documents = loader.load_data(file=Path("./knowledge/faq.md"))
  index = SummaryIndex.from_documents(documents, service_context=service_context)

  query_engine = index.as_query_engine()
  query_engine.update_prompts(
    {"response_synthesizer:text_qa_template": qa_template}
  )

  answer = query_engine.query(question)

  return { "answer": str(answer )}

