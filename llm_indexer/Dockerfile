FROM python:3.11
WORKDIR /var/www

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8000
COPY . .

CMD ["uvicorn", "main:app","--host", "0.0.0.0", "--port", "8000"]
