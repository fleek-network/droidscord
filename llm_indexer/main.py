from typing import Union
from fastapi import FastAPI

import os
from llama_index import QuestionAnswerPrompt, GPTSimpleVectorIndex, SimpleDirectoryReader
from pathlib import Path
from llama_index import download_loader

app = FastAPI()

@app.get("/ping")
def read_root():
  return "pong"

@app.get("/query")
def query(question: Union[str, None] = None):
  MarkdownReader = download_loader("MarkdownReader")

  loader = MarkdownReader()
  # documents = loader.load_data(file=Path('../README.md'))
  documents = loader.load_data(file=Path('./fleek-network-node-health-check-guide.md'))

  # documents = SimpleDirectoryReader('./fleek-network-node-health-check-guide.md').load_data()
  index = GPTSimpleVectorIndex.from_documents(documents)

  # load from disk
  # index = GPTSimpleVectorIndex.load_from_disk('index.json')

  # response = index.query("How to do a healthcheck?")
  # print(response)

  index = GPTSimpleVectorIndex.from_documents(documents)

  answer = index.query(question)

  return {"answer": answer}

@app.get("/queryv2")
def queryv2(question: Union[str, None] = None):
  MarkdownReader = download_loader("MarkdownReader")
  loader = MarkdownReader()
  documents = loader.load_data(file=Path('./fleek-network-node-health-check-guide.md'))
  query_str = "How to do a health check?"
  QA_PROMPT_TMPL = (
      "We have provided context information below. \n"
      "---------------------\n"
      "{context_str}"
      "\n---------------------\n"
      "Given this information, please answer the question: {query_str}\n"
      "Share the filename where the information comes from\n"
  )
  QA_PROMPT = QuestionAnswerPrompt(QA_PROMPT_TMPL)
  # Build GPTSimpleVectorIndex
  index = GPTSimpleVectorIndex.from_documents(documents)

  response = index.query(query_str, text_qa_template=QA_PROMPT, similarity_top_k=3)

  return response.response

@app.put("/index")
def index():
    return {"item_name": item.name, "item_id": item_id}