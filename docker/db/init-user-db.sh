#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres postgres <<-EOSQL
    CREATE USER pybossa WITH CREATEDB NOSUPERUSER ENCRYPTED PASSWORD 'tester';
    CREATE DATABASE pybossa OWNER pybossa
    ENCODING 'UTF-8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;
    -- Create test user and test DB
    CREATE USER rtester WITH CREATEDB NOSUPERUSER;
    CREATE DATABASE pybossa_test OWNER rtester
    ENCODING 'UTF-8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;
EOSQL
