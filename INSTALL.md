# bundle-development

- git clone --recursive git@github.com:fiyge/bundle-development.git
- If installing on local machine then make entry into /etc/hosts file for virtual host pointing to 127.0.0.1
- Setup virtual host domain in nginx
- Open project url in browser to complete installation process.
- Accept licence.
- Make sure all required php extensions are available else installation won’t proceed. Also set php memory limit to 1024MB.
- Fill in database name, username, password for all 3 databases. Select sql mode of installation if not installing from JSON.
- Select optional modules for installation. Click Next.
- WARNING:Sometime the tmp config files holding installation settings may not be detected by php engine 8, restarting php engine will fix it. The installer will report "no module selected for installation".
- Once installation complete login with admin@maaxframe.com
