#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username postgres postgres <<-EOSQL
    DROP DATABASE IF EXISTS pybossa;
    CREATE DATABASE pybossa OWNER pybossa
    ENCODING 'UTF-8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;
    -- Create test DB
    DROP DATABASE IF EXISTS pybossa_test;
    CREATE DATABASE pybossa_test OWNER rtester
    ENCODING 'UTF-8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;
EOSQL
