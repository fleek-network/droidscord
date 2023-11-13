from typing import Union
from fastapi import FastAPI

import os
from llama_index import QuestionAnswerPrompt,  SimpleDirectoryReader, SimpleWebPageReader, SummaryIndex
from pathlib import Path
from llama_index import download_loader

app = FastAPI()

@app.get("/ping")
def read_root():
  return "pong"

@app.get("/query")
def query(question: Union[str, None] = None):
  documents = SimpleWebPageReader(html_to_text=True).load_data(["https://docs.fleek.network/docs/node/health-check"])
  index = SummaryIndex.from_documents(documents)

  query_engine = index.as_query_engine()

  answer = query_engine.query(question)

  print(answer)
    
  # return answer
  return { "answer": str(answer )}

@app.put("/index")
def index():
    return {"item_name": item.name, "item_id": item_id}
