FROM --platform=linux/arm64 python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

RUN pip install --no-cache-dir -r server/requirements.txt

RUN apt-get update && apt-get install -y nodejs npm

RUN apt-get install -y nginx

WORKDIR /app/web
RUN npm install
RUN npm run build

WORKDIR /app

COPY nginx.conf /etc/nginx/nginx.conf

# Make port 80 available to the world outside this container
EXPOSE 80

ENV NAME World

CMD service nginx start && cd server && python main.py