IN_FILE = 'DecidingForceSchema_Sample/schema1.txt'

TITLE_ID = 'title:'
INSTRUCTIONS_ID = 'instructions:'
GLOSSARY_ID = 'glossary:'
DEPENDENCY_ID = 'if'
DEPENDENCY_TARGET = 'then'

def parse_schema(schema_file=IN_FILE):
    parsed_schema = {}
    with open(schema_file, 'r') as f:
        for line in f:
            raw_line = line.strip()

            # Throw out blank lines
            if not raw_line:
                continue

            # Infer the line type and parse accordingly
            type_id, data = raw_line.split(None, 1)
            if type_id.lower() == TITLE_ID:
                parse_title(data, parsed_schema)
            elif type_id.lower() == INSTRUCTIONS_ID:
                parse_instructions(data, parsed_schema)
            elif type_id.lower() == GLOSSARY_ID:
                parse_glossary(data, parsed_schema)
            elif type_id.lower() == DEPENDENCY_ID:
                parse_dependency(data, parsed_schema)
            else:
                parse_question_entry(type_id, data, parsed_schema)
    return parsed_schema

def parse_title(title, output):
    output['title'] = title

def parse_instructions(instructions, output):
    output['instructions'] = instructions

def parse_glossary(glossary_entry, output):
    if 'glossary' not in output:
        output['glossary'] = {}
    term, definition = glossary_entry.split(':', 1)
    output['glossary'][term.strip()] = definition.strip()

def parse_dependency(dependency, output):
    if 'dependencies' not in output:
        output['dependencies'] = []
    source, target = dependency.split(DEPENDENCY_TARGET, 1)
    output['dependencies'].append((source.strip().strip(','),
                                 target.strip()))

def parse_question_entry(entry_id, data, output):
    type_bits = entry_id.split('.')
    num_bits = len(type_bits)
    if num_bits == 1:
        topic_id = type_bits[0]
        if 'topics' not in output:
            output['topics'] = {}
        output['topics'][topic_id] = {
            'name': data.strip(),
            'questions': {},
        }
    elif num_bits == 2:
        topic_id, question_id = type_bits
        question_id = type_bits[1]
        topic = output['topics'][topic_id]
        question_type, question_text = data.split(None, 1)
        topic['questions'][question_id] = {
            'text': question_text,
            'type': question_type,
            'answers': {}
        }
    else:
        topic_id, question_id, answer_id = type_bits
        question = output['topics'][topic_id]['questions'][question_id]
        question['answers'][answer_id] = {
            'text': data
        }

def print_data(output):
    print "Here's the current parsed data:"
    import pprint; pprint.pprint(output)

if __name__ == '__main__':
    output = parse_schema(IN_FILE)
    print_data(output)
