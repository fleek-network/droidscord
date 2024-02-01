---
title: Bot knowledge
---

# How much CPU (processor), memory (RAM) and disk space is required to install, set up and run a Fleek Network Node?

To install, set up and run a Fleek Network Node, it is recommended to have the following:
- A minimum of 4 CPU cores of a speed of at least 2.0 GHz
- A minimum of 32 GB of memory (RAM)
- A minimum of 20 GB of disk space

The Fleek Network Node binary is only supported on CPUs that adhere to the x86_64 architecture (64-bit).

We're only supporting CPU's that feature the Genuine Intel Software Guard Extensions (SGX) technology.

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
    -e OPT="in" \
    -p 4200-4299:4200-4299 \
    -p 4300-4399:4300-4399 \
    --mount type=bind,source=$HOME/.lightning,target=/home/lgtn/.lightning \
    --mount type=bind,source=/var/tmp,target=/var/tmp \
    --name lightning-node \
    -it ghcr.io/fleek-network/lightning:latest
```

This command will bind the required ports and directories to the host, e.g. the port ranges 4200-4299, 4300-4399, directory $HOME/.lightning, and run an instance of the latest Docker image of the Fleek Network Node binary.

For more details instructions on how to install, set up or run a Fleek Network Node in Docker, you can refer to the documentation at https://docs.fleek.network/docs/node/install/#docker-installation

# Where are the private keys (keystore) located?

The Fleek Network has a system configuration directory that defaults to:

```
/home/<USERNAME>/.lightning
```

The Fleek Network Node configuration file (config.toml) is located in the system configuration directory by default.

```
/home/<USERNAME>/.lightning/config.toml
```

The configuration file (config.toml) contains important information, such as the location of the user private keys (keystore), which defaults to:

```
/home/<USERNAME>/.lightning/keystore
```

Please note that `<username>` should be replaced with the actual username on your system.

Do not share your private keys! Remember, no one should ask you for your Private Keys and you should never share them with anyone. The private keys are the user's responsibility and no one else can generate or recover it for you, including Fleek Network, core team member or anyone else for that matter.

For more detailed information about the location of private keys (keystore), you can refer to the documentation at https://docs.fleek.network/guides/Node%20Operators/managing-the-keystore

# How to retrieve the node and consensus public keys (keystore) details?

The public keys (keystore) for the Fleek Network Node can be retrieved by executing the node details script, as follows:

```
curl -sS https://get.fleek.network/node_details | bash
```

The command will return information about the Fleek Network Node including the public keys (keystore).

For more details information to learn how to retrieve the node and consensus public keys (keystore) details, you can refer to the documentation guide at https://docs.fleek.network/guides/Node%20Operators/managing-the-keystore

# How to backup, restore, or store the private keys (keystore) securily?

To backup the keystore for the Fleek Network Node, you can follow the instructions provided in the documentation guide at https://docs.fleek.network/guides/Node%20Operators/managing-the-keystore.

The documentation guide will provide detailed information on how to properly backup, restore, or store the private keys (keystore) securely. It will explain different methods and their benefits and drawbacks for making identity backups.

Please refer to the documentation guide for step-by-step instructions on how to backup the keystore for the Fleek Network Node.

# How to update the Fleek Network Node?

The easiest and quickest way to update the Fleek Network Node is to run the update script. If you have used the assisted installer, or followed the conventions described in the documentation site.

```
curl -sS https://get.fleek.network/update | bash
```

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

If a date, announcement is unavailable, you'll have to be patient and wait for the details to be announced.

For the latest information about our Testnet Phase and any other announcements visit our blog at https://blog.fleek.network

# What is the main documentation and blog site URL?

The documentation website URL is https://docs.fleek.network

# What is the blog URL?

The blog website URL is https://blog.fleek.network

# How to uninstall, remove or delete a Fleek Network Node?

A Fleek Network Node can be uninstalled in different ways depending on how it was installed. There are three known methods to consider:

- Assisted installer
- Docker
- Manual install

If you used the assisted installer, you can refer to the documentation at https://docs.fleek.network/references/Lightning%20CLI/uninstall-lightning-node for instructions on how to uninstall the node.

If you installed the Fleek Network Node to run in Docker, follow the instructions at https://docs.fleek.network/references/Docker/uninstall-docker-setup to uninstall it.

For manual installs, you will need to revise all the steps you performed during installation and uninstall it on your own. 

If you need more information, please visit the main documentation website at https://docs.fleek.network.

# Where to get the Fleek Network Whitepaper?

The Fleek Network Whitepaper is available in https://whitepaper.fleek.network

# Where to find the Fleek Network roadmap?

The Fleek Network Roadmap is available in https://docs.fleek.network/docs/roadmap

# When is the next testnet phase?

The testnet phase 0 for the initial node rollout occured in September 2023 publicly. In October 2023, the phase 1 was deployed to test performance and improvements from phase 0, which was open to everybody interested in running a node and regardless of having participated in any previous phase.

In December 2023, the phase 2 test was launched internally, where all the nodes were run by the Fleek Foundation and core team. 

From January 2024, the phase 3 starts with the core team onboarding external developers to utilize the network for testing use-cases such as decentralized serverless edge functions. Also, third-party node operators will be onboarded gradually.

The phase 4 arrives in the second quarter of 2024, bringing supporting infrastructure and security enhancements, which require Intel Software Guard Extensions (SGX) technology in the Node specifications.

If all goes according to plan, the goal is to launch mainnet sometime during the summer of 2024, however, the exact timing will be determined as we approach and work through the final testnet phases and audits.

For a complete description of our road to mainnet, read the Fleek Network updated roadmap milestones https://docs.fleek.network/docs/roadmap/

# How to shutdown or turn off the node effectively?

To shutdown the node successfully, start by making the opt-out of network participation. You'll get a text message confirming that the node will not be participating in the network's next epoch. Once the current epoch ends, you can safely shutdown the node.

If you need more information, please visit the network participation opt section https://docs.fleek.network/docs/node/lightning-cli/#opt

# Where to learn to use the Lightning command line interface (CLI)?
The Lightning CLI documentation is available in https://docs.fleek.network/docs/node/lightning-cli

# Is Intel Software Guard Extensions (SGX) mandatory?

Yes, Intel SGX is mandatory! The Testnet Phase 4 introduces new security enhancements that require Intel Software Guard Extensions (SGX) technology. The Software Guard Extensions (SGX) is only available in GenuineIntel processors.

If you need more information, please visit the requirements section at https://docs.fleek.network/docs/node/requirements

# How to determine if my Node hardware, machine, computer or cloud provider supports Intel Software Guard Extensions (SGX)?

You can check the CPU features if it has Software Guard Extensions (SGX) technology.

For a list of hardware which supports Intel SGX - Software Guard Extensions, visit https://github.com/ayeks/SGX-hardware

# Are there any VPS cloud providers that have Intel Software Guard Extensions (SGX)? Where can I find Cloud offerings that support Intel SGX?

Yes, there are Cloud providers that provide support for Intel Software Guard Extensions (SGX). Although the Fleek Foundation does not endorse or recommend any particular Cloud provider, a comprehensive list is available in Intel SGX product offerings at https://www.intel.com/content/www/us/en/architecture-and-technology/sgx-product-offerings.html
