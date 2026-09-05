SHELL        := /bin/bash
COMPOSE_FILE := docker-dev/docker-compose.yml
PROJECT      := portfolio-dev
COMPOSE      := docker compose -p $(PROJECT) -f $(COMPOSE_FILE)
STUDIO_DB_URL := postgresql://portfolio:portfolio@localhost:5433/portfolio_dev

.DEFAULT_GOAL := help

.PHONY: help up up-fg down restart logs ps sh migrate seed studio clean

help:
	@echo "make up        - build and start containers (detached)"
	@echo "make up-fg     - build and start containers (foreground, follow logs)"
	@echo "make down      - stop and remove containers"
	@echo "make restart   - restart containers"
	@echo "make logs      - follow container logs"
	@echo "make ps        - list container status"
	@echo "make sh        - shell into the app container"
	@echo "make migrate   - apply Prisma migrations"
	@echo "make seed      - seed the database"
	@echo "make studio    - open Prisma Studio against the container DB"
	@echo "make clean     - stop containers and delete volumes (wipes the DB)"

up:
	$(COMPOSE) up --build -d

up-fg:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

sh:
	$(COMPOSE) exec app sh

migrate:
	$(COMPOSE) exec app npx prisma migrate deploy

seed:
	$(COMPOSE) exec app npm run db:seed

studio:
	DATABASE_URL="$(STUDIO_DB_URL)" npx prisma studio

clean:
	$(COMPOSE) down -v
