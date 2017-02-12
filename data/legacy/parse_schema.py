import argparse
from collections import namedtuple

IN_FILE = 'old-schema1.txt'

TITLE_ID = 'title:'
INSTRUCTIONS_ID = 'instructions:'
GLOSSARY_ID = 'glossary:'
DEPENDENCY_ID = 'if'
DEPENDENCY_TARGET = 'then'

QUESTION_TYPES = {'mc' : 'RADIO',
                  'cl' : 'CHECKBOX',
                  'dttm' : 'DATETIME',
                  'dt' : 'DATE',
                  'tb' : 'TEXT',
                  'tm' : 'TIME',
                  'dd' : 'RADIO',
                  'tx' : 'TEXT'}   # The last three are legacy formats

Dependency = namedtuple('Dependency', 
    ['topic', 'question', 'answer', 'next_question'])

def load_defaults(output):
    output['parent'] = ''
    output['topics'] = []
    output['glossary'] = {}
    output['dependencies'] = []

def parse_schema(schema_file=IN_FILE):
    parsed_schema = {}
    load_defaults(parsed_schema)
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
    
    splitted_dependency = dependency.split(', ')
    source_phrase = splitted_dependency[0]
    target_phrase = splitted_dependency[1].split(' ')[1]
    source_topic_id, source_question_id, source_answer_id = (
        source_phrase.split('.'))
    target_question = target_phrase.split('.')[1]

    source_topic_id = int(source_topic_id)
    source_question_id = int(source_question_id)
    target_question = int(target_question)

    # Handle the case "any" seperately
    if source_answer_id == "any":
        topic = [t for t in output['topics'] 
                 if int(t['id']) == source_topic_id][0]
        question = [q for q in topic['questions'] 
                    if int(q['question_number']) == source_question_id][0]
        for answer in question['answers']:
            new_source_answer_id = int(answer['answer_number'])
            output['dependencies'].append(Dependency(source_topic_id, 
                                                     source_question_id, 
                                                     new_source_answer_id, 
                                                     target_question))

    else:
        source_answer_id = int(source_answer_id)

        output['dependencies'].append(Dependency(source_topic_id, 
                                                 source_question_id, 
                                                 source_answer_id, 
                                                 target_question))


def parse_question_entry(entry_id, data, output):
    type_bits = entry_id.split('.')
    num_bits = len(type_bits)
    if num_bits == 1:
        try:
            topics_id = int(type_bits[0])
        except ValueError:
            return 
        topic_id = type_bits[0]
        if 'topics' not in output:
            output['topics'] = []
        output['topics'].append({
            'id': topic_id,
            'name': data.strip(),
            'questions': [],
        })
    elif num_bits == 2:
        topic_id, question_id = type_bits
        question_id = type_bits[1]
        topic = [t for t in output['topics'] if t['id'] == topic_id][0]
        question_type, question_text = data.split(None, 1)
        if question_type in QUESTION_TYPES:
            question_type = QUESTION_TYPES[question_type]
        topic['questions'].append({
            'question_number': question_id,
            'question_text': question_text,
            'question_type': question_type,
            'answers': [],
        })
    else:
        topic_id, question_id, answer_id = type_bits
        topic = [t for t in output['topics'] if t['id'] == topic_id][0]
        question = [q for q in topic['questions'] if q['question_number'] == question_id][0]
        question['answers'].append({
            'answer_number': answer_id,
            'answer_content': data,
        })

def print_data(output):
    print "Here's the current parsed data:"
    import pprint; pprint.pprint(output)

if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument('filename', nargs=1)
    args = arg_parser.parse_args()
    
    output = parse_schema(args.filename[0])
    print_data(output)
