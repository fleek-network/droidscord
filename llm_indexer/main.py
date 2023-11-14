from typing import Union
from fastapi import FastAPI
import os
from llama_index import QuestionAnswerPrompt,  SimpleDirectoryReader, SimpleWebPageReader, SummaryIndex, TreeIndex
from llama_hub.web.sitemap.base import SitemapReader
from pathlib import Path
from llama_index import download_loader
from llama_index.prompts import PromptTemplate

app = FastAPI()
loader = SitemapReader()

template = (
    "We have provided context information below. \n"
    "---------------------\n"
    "{context_str}"
    "\n---------------------\n"
    "Given this information, please answer the question and include the source url or documented loaded where the information comes from: {query_str}\n"
)
qa_template = PromptTemplate(template)

@app.get("/ping")
def read_root():
  return "pong"

@app.get("/query")
def query(question: Union[str, None] = None):
  documents = SimpleWebPageReader(html_to_text=True).load_data(["https://docs.fleek.network/docs/node/install"])
  # documents = loader.load_data(sitemap_url='https://docs.fleek.network/sitemap.xml')

  # index = SummaryIndex.from_documents(documents)
  index = TreeIndex.from_documents(documents)

  query_engine = index.as_query_engine()
  query_engine.update_prompts(
    {"response_synthesizer:text_qa_template": qa_template}
  )

  answer = query_engine.query(question)

  print(answer)
  print(answer.source_nodes[0].node.metadata)
  # return answer
  return { "answer": str(answer )}

