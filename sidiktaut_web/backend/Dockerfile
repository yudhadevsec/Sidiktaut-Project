FROM python:3.9
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . /code
# Buat folder cache biar module whois gak error permission
RUN mkdir -p /code/.cache && chmod -R 777 /code/.cache
CMD ["gunicorn", "-b", "0.0.0.0:7860", "app:app"]