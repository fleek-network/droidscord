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
