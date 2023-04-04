import os
os.environ["OPENAI_API_KEY"] = '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'

from llama_index import GPTSimpleVectorIndex, SimpleDirectoryReader
from pathlib import Path
from llama_index import download_loader

MarkdownReader = download_loader("MarkdownReader")

loader = MarkdownReader()
documents = loader.load_data(file=Path('../README.md'))

# documents = SimpleDirectoryReader('data').load_data()
# index = GPTSimpleVectorIndex.from_documents(documents)

# load from disk
# index = GPTSimpleVectorIndex.load_from_disk('index.json')

# response = index.query("What's the book author name?")
# print(response)


index = GPTSimpleVectorIndex.from_documents(documents)

response = index.query("What's the title?")
print(response)
