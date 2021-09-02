Development of submodule code.
- make changes in your local submodules.
- commit changes to development branch. 
- merge changes in "main" branch of submodule.

Update project to latest version of submodules("main" branch).
- git clone --recurse-submodules git@github.com:fiyge/bundle-development.git
- cd bundle-development
- git submodule update --remote
- git add .
- git commit -m "git submodule updated"
- git push origin

Updating all deployed versions of project. From your project run
- git submodule update --init --recursive

Commit module changes recursively
- git submodule foreach 'echo $sm_path `git add .`'
- git submodule foreach 'echo $sm_path `git commit -m "v5.0.7" `'
- git submodule foreach 'echo $sm_path `git push`'
