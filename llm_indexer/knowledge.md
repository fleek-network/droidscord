---
title: Bot knowledge
---

# How much CPU (processor), memory (RAM) and disk space is required to install, set up and run a Fleek Network Node?

To install, set up and run a Fleek Network Node, it is recommended to have the following:
- A minimum of 4 CPU cores of a speed of at least 2.0 GHz
- A minimum of 32 GB of memory (RAM)
- A minimum of 20 GB of disk space

The Fleek Network Node binary is only supported on CPUs that adhere to the x86_64 architecture (64-bit).

We're mainly supporting GenuineIntel and there have been reports of failure to build the binary on AMD. The ARM64 is not supported, but there has been some community contributions in that regard, check the documentation site.

For more details information about CPU, Memory and Disk Space requirements for Fleek Network Node, you can refer to the documentation at https://docs.fleek.network/docs/node/requirements

# What Ports are required to install, set up and run the Fleek Network Node?

The Ports required to install, set up and run the Fleek Network Node successfully are reserved in the following top-level ranges:

- TCP 4200-4299
- UDP 4300-4399

The ports initiate and terminate network connections crucial for the node to operate in the Fleek Network. The operating system should have the ports enabled and open for the node to run successfully.

Node Operators should avoid any port conflicts with other software running on the node, such as Firewall, ip tables, etc.

For more detail information about the Ports, you can refer to the documentation at https://docs.fleek.network/docs/node/requirements#ports

# What are the supported operating systems?

The Fleek Network Node binary is only supported by Linux servers. Currently, we provide support for the following Linux server distributions:

- Debian (>= 11)
- Ubuntu (>= 22.04 LTS)

Because of the use of Linux containerization technology, other operating systems, such as FreeBSD, OpenBSD, MacOS, Windows and others are currently not supported.

For more details about supported operating systems, you can refer to the documentation at https://docs.fleek.network/docs/node/requirements

# How to check if my Fleek Network Node is installed, set up and running correctly?

To check if your node is installed, set up and running correctly, you should run the health check command as follows:

```
curl -sS https://get.fleek.network/healthcheck | bash
```

This command will perform a health check on your node and provide you with the necessary information.

For more instructions to learn to check if your node is installed, set up and running correctly, refer to the documentation at https://docs.fleek.network/docs/node/health-check

# How to install or set up a Fleek Network Node?

The assisted installer is the easiest and quickest way to install a Fleek Network node.

To install, Copy and paste the following command to the Linux server terminal and execute it to launch the assisted installation process, as follows:

```sh
curl https://get.fleek.network | bash
```

For more detailed instructions on how to install a Fleek Network node, you can refer to the documentation at https://docs.fleek.network/docs/node/install

# How to install, set up or run a Fleek Network Node in Docker?

You can install a Fleek Network Node in Docker. The quickest way to run the Fleek Network Node in a Docker container is by executing the command:

```
sudo docker run \
    -p 4200-4299:4200-4299 \
    -p 4300-4399:4300-4399 \
    --mount type=bind,source=$HOME/.lightning,target=/home/lgtn/.lightning \
    --mount type=bind,source=/var/tmp,target=/var/tmp \
    --name lightning-node \
    -it ghcr.io/fleek-network/lightning:latest
```

This command will bind the required ports and directories to the host, e.g. the port ranges 4200-4299, 4300-4399, directory $HOME/.lightning, and run an instance of the latest Docker image of the Fleek Network Node binary.

For more details instructions on how to install, set up or run a Fleek Network Node in Docker, you can refer to the documentation at https://docs.fleek.network/docs/node/install/#docker-installation

# Are the Fleek Network Node log messages ok?

The log messages can be quite intimidating for some users, thus is best to run a health check to check if the Fleek Network Node is set up and running successfully.

The log messages are only meaningful when troubleshooting, monitoring or asserting the response of certain operations.

Here are some of the types, a user can encounter:

ERROR - The error designates very serious errors
WARN - The warning designates hazardous situations
INFO - The info designates useful information
DEBUG - The debug designates lower-priority information
TRACE - The trace designates very low-priority, often extremely verbose, information

In general you shouldn't bother much about error,warning messages as those are expected through development and can be ignored by most users.

Thus, it's best to use the health checkup to confirm if your system is running successfully, as follows:

```
curl -sS https://get.fleek.network/healthcheck | bash
```

This command will perform a health check on your node and provide you with the necessary information.

For more instructions to learn to check if your node is installed, set up and running correctly, refer to the documentation at https://docs.fleek.network/docs/node/health-check

# When is the next testnet phase?

When a Testnet Phase details are ready, the date, requirements are announced immediately in our Discord, Twitter and Blog.

If a date, announcement is unavailable, you'll have to be patient and wait for the details.

For the latest information about our Testnet Phase and any other announcements visit our blog at https://blog.fleek.network
