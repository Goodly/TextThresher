IN_FILE = 'schema1.txt'

TITLE_ID = 'title:'
INSTRUCTIONS_ID = 'instructions:'
GLOSSARY_ID = 'glossary:'
DEPENDENCY_ID = 'if'
DEPENDENCY_TARGET = 'then'

DATA = {}

def parse_schema(schema_file):
    with open(schema_file, 'r') as f:
        for line in f:
            raw_line = line.strip()

            # Throw out blank lines
            if not raw_line:
                continue

            # Infer the line type and parse accordingly
            type_id, data = raw_line.split(None, 1)
            if type_id.lower() == TITLE_ID:
                parse_title(data)
            elif type_id.lower() == INSTRUCTIONS_ID:
                parse_instructions(data)
            elif type_id.lower() == GLOSSARY_ID:
                parse_glossary(data)
            elif type_id.lower() == DEPENDENCY_ID:
                parse_dependency(data)
            else:
                parse_question_entry(type_id, data)

def parse_title(title):
    DATA['title'] = title

def parse_instructions(instructions):
    DATA['instructions'] = instructions

def parse_glossary(glossary_entry):
    if 'glossary' not in DATA:
        DATA['glossary'] = {}
    term, definition = glossary_entry.split(':', 1)
    DATA['glossary'][term.strip()] = definition.strip()

def parse_dependency(dependency):
    if 'dependencies' not in DATA:
        DATA['dependencies'] = []
    source, target = dependency.split(DEPENDENCY_TARGET, 1)
    DATA['dependencies'].append((source.strip().strip(','),
                                 target.strip()))

def parse_question_entry(entry_id, data):
    type_bits = entry_id.split('.')
    num_bits = len(type_bits)
    if num_bits == 1:
        topic_id = type_bits[0]
        if 'topics' not in DATA:
            DATA['topics'] = {}
        DATA['topics'][topic_id] = {
            'name': data.strip(),
            'questions': {},
        }
    elif num_bits == 2:
        topic_id, question_id = type_bits
        question_id = type_bits[1]
        topic = DATA['topics'][topic_id]
        question_type, question_text = data.split(None, 1)
        topic['questions'][question_id] = {
            'text': question_text,
            'type': question_type,
            'answers': {}
        }
    else:
        topic_id, question_id, answer_id = type_bits
        question = DATA['topics'][topic_id]['questions'][question_id]
        question['answers'][answer_id] = {
            'text': data
        }

def print_data():
    print "Here's the current parsed data:"
    import pprint; pprint.pprint(DATA)

if __name__ == '__main__':
    parse_schema(IN_FILE)
    print_data()
