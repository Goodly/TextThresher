#!/bin/bash
docker-compose exec pybossa supervisorctl stop pybossa
docker-compose exec db sh /scripts/reset_pybossa_db.sh
docker-compose exec pybossa supervisorctl start pybossa
docker-compose run pybossa sh /ansible_build/init_db.sh
