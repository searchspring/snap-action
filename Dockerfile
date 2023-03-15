FROM debian:sid-slim

RUN apt update && DEBIAN_FRONTEND=noninteractive apt install -y --no-install-recommends awscli less gpg gpg-agent curl wget git lsof unzip dirmngr ca-certificates jq nodejs chromium chromium-driver chromium-sandbox libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2 libxtst6 xauth xvfb \
    && rm -rf /var/lib/apt/lists/*%

# Add 'snap' user in 'runner' group
RUN adduser --disabled-password --gecos "" --uid 1000 snap \
    && groupadd runner \
    && usermod -aG runner snap

# Create hostedtoolcache and give permission to 'runner' group
RUN mkdir /opt/hostedtoolcache \
    && chgrp runner /opt/hostedtoolcache \
    && chmod g+rwx /opt/hostedtoolcache

WORKDIR /home/snap
ENV HOME=/home/snap
USER snap

CMD ["bash"]