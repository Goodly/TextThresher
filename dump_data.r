library(RPostgreSQL)
drv <- dbDriver("PostgreSQL")
con <- dbConnect(drv, dbname="thresher")
rs <- dbSendQuery(con, 'select T.id as tua_id, T.offsets as tua_offsets, A.text as article_text, A.city_published as city, A.state_published as state, A.date_published as date, A.article_id, A.periodical_code, A.annotators as annotators, TT.name as tua_type from thresher_tua T, thresher_article A, thresher_analysistype TT where T.article_id = A.article_id and T.analysis_type_id = TT.id;')
data <- fetch(rs, n=-1)
write.csv(data, file = "tua_data.csv", fileEncoding = "UTF-8")

# The above creates a file "tua_data.csv" with the data dump.
# It can be loaded back in with:
# data <- read.csv("tua_data.csv", header = TRUE, colClasses = c('character', 'integer', 'character', 'character', 'character', 'character', 'Date', 'integer', 'integer', 'character', 'character'))