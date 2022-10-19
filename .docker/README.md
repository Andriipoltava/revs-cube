# Docker-Compose Local Dev Environment

Using the files in this directory you will be able to set up a local dev environment with all of the dependencies required to work on the site

## What you will need

There are a few things you will need to get this running and looking like the live site

- A copy of the plugins directory
- A copy of the uploads directory
- A database dump with the live url renamed to `http://localhost:8080` (Use WP Migrate DB for this)

Plugins can be installed via WP CLI (more on this later) but as some plugins are paid and not on the public Wordpress marketplace you need to download them anyway.

## Getting started

Place the SQL script containing your database dump in the `.docker/db` directory. This will be picked up when the containers run and initialise your local database.

Start the containers by running `docker-compose up -d` in this directory. This will run all of the containers in the background and start initialising the database. While that is happening we can copy over the required files.

Next you should copy the plugins from the live server into the `plugins` directory in the root, and the same for the uploads into the `uploads` directory in the root of the project.

By the time you have done this the database should have finished importing. You can now navigate to `http://localhost:8080` in your browser. If you get a message saying the database requires updating due to Wordpress versions you can go ahead and proceed with that.

## Building Node

Finally, you will need to build the node parts of the theme. To do this there will already be a container running with the required node version and you can run the following commands to install the node_modules and run gulp.

- `docker exec -it rdc-node npm i`
- `docker exec -it rdc-node npm run build`

## WP CLI

If you need to install new plugins then to save time you can use WP CLI. This is configured using a shared volume in the docker-compose file to give WP CLI access to the Wordpress install. There is a container running WP CLI already and you could run something like `docker exec -it rdc-wordpress-cli wp plugin install timber-library --activate`.

## Too much typing?

Since most of the build dependencies use tools from other containers it's probably worth aliasing some of these commands to save you typing `docker exec -it` over and over again.
