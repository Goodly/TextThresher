from django.db import models

# Articles containing text for analysis
class Article(models.Model):
    # unique id
    article_id = models.IntegerField(primary_key=True)

    # raw article text
    text = models.TextField()

    # metadata
    date_published = models.DateField(null=True)
    city_published = models.CharField(max_length=1000)
    state_published = models.CharField(max_length=2, null=True)
    periodical = models.CharField(max_length=1000)
    periodical_code = models.IntegerField()
    parse_version = models.CharField(max_length=5, null=True)
    annotators = models.CharField(max_length=1000) # as a JSON list

# Possible Analysis Types
class AnalysisType(models.Model):
    name = models.CharField(max_length=40, unique=True)
    requires_processing = models.BooleanField()
    instructions = models.TextField()
    glossary = models.TextField() # as a JSON map
    topics = models.TextField() # as a big JSON blob.
    question_dependencies = models.TextField() # as a big JSON blob.

# A Text Unit of Analysis (TUA).
# TUAs have types and reference text within an article
class TUA(models.Model):
    # The type of the TUA
    analysis_type = models.ForeignKey(AnalysisType)

    # The referenced article
    article = models.ForeignKey(Article)

    # The relevant offsets in the article text.
    # Stored as a JSON list of (start, end) pairs.
    offsets = models.TextField()

    # A unique id for TUAs of this type in this article
    tua_id = models.IntegerField(max_length=10)

    # Have we answered questions about this TUA yet?
    is_processed = models.BooleanField(default=False)

    # A tua_id is unique per analysis_type per article
    class Meta:
        unique_together = ("tua_id", "analysis_type", "article")
