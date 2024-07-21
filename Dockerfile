FROM ubuntu:latest

RUN apt update

RUN apt install curl -y

RUN mkdir -p /home/biraj

WORKDIR /home/biraj

# copy the function here
COPY "<function-file-full>" .

# run the file
CMD ["/bin/bash", "<function-filename>"]