+++
title = 'Recv'
date = 2021-02-10T15:48:35-05:00
draft = false
summary = "Intro to the `recv` system call, and a common mistake beginners make when employing `recv`."
author = "Saveliy Yusufov"
math = "katex"
disableShare = false
tags = ["C Programming", "recv System Call", "Socket Communication", "TCP/IP Sockets", "Socket Programming Best Practices", "Sockets", "Network Programming in C", "System Calls"]
+++

Recv
====

The recv system call
====================

### Background

Learning how to use the sockets API was one of the most rewarding programming experiences I had, but there are a myriad of caveats that can snag up even seasoned developers. Let’s take a look at one of these potential pitfalls and attempt to address it.

### The recv system call

For the sake of simplicity, we’ll only consider the case of a _non-blocking_ socket on a single-threaded server.

The recv system call is as follows:

    ssize_t recv(int socket, void *buffer, size_t length, int flags);


Moreover, the return values are documented as follows:

    These calls return the number of bytes received, or -1 if an error occurred.
    
    For TCP sockets, the return value 0 means the peer has closed its half side of the connection.


### What not to do

    while ((bytes_read = recv(client_sock, buffer, sizeof(buffer)-1, 0)) > 0) {
        // do stuff with buffer
    }


Why is this wrong? If we go back to the man page using `man 2 recv`, we’ll find this vital snippet:

`The receive calls normally return any data available, up to the requested amount, rather than waiting for receipt of the full amount requested`

### The fix

    do {
        bytes_read = recv(client_sock, &buffer[total_recvd], sizeof(buffer)-total_recvd, 0);
        if (bytes_read <= 0) {
            break;
        } else {
            total_recvd += bytes_read;
        }
    }
    while (total_recvd < sizeof(buffer));


There are a few things to note here:

0.  As long as no error occurred, and the connection wasn’t closed, we keep a running total of the amount of bytes we expected, (i.e., `total_recvd`).
1.  We want to continue to recv data into the buffer, but we don’t want to overwrite the data we already received, so we advance the `buffer` pointer by the amount of data we’ve already received .
2.  The length supplied to `recv` should be advanced as a function of our buffer size and the amount of data we already received.
