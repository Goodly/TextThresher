# For defining [Topic]hint_type, [Question]hint_type, [NLP_hints]hint_type
HINT_TYPE_CHOICES = (
        ('NONE', 'No hint'),
        ('WHERE', 'Where'),
        ('WHO', 'Who'),
        ('HOW MANY', 'How many'),
        ('WHEN', 'When'),
)

# nlp_exporter uses for requesting all available hints from NLP-Hints service
QUESTION_TYPES = (
    { 'ID': 1, 'Question': 'Where' },
    { 'ID': 2, 'Question': 'Who' },
    { 'ID': 3, 'Question': 'How many' },
    { 'ID': 4, 'Question': 'When' }
)

# nlp_importer uses for mapping question_id back to hint_type
QUESTION_TO_HINT_TYPE = {
    '1': 'WHERE',
    '2': 'WHO',
    '3': 'HOW MANY',
    '2': 'WHEN'
}
