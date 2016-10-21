import argparse
from collections import namedtuple

IN_FILE = 'sample/schema/schema1.txt'

TITLE_ID = 'title:'
PARENT_ID = 'parent:'
INSTRUCTIONS_ID = 'instructions:'
GLOSSARY_ID = 'glossary:'
DEPENDENCY_ID = 'if'
DEPENDENCY_TARGET = 'then'
MANDATORY_Q = '?'
CONTINGENT_Q = '*'
Dependency = namedtuple('Dependency', ['topic', 'question', 'answer', 'next_question'])

def is_answer(type_id):
    return type_id.isalpha() and len(type_id) == 1

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
            elif type_id.lower() == PARENT_ID:
                parse_parent(data, parsed_schema)
            elif type_id.lower() == INSTRUCTIONS_ID:
                parse_instructions(data, parsed_schema)
            elif type_id.lower() == GLOSSARY_ID:
                parse_glossary(data, parsed_schema)
            elif type_id.lower() == DEPENDENCY_ID:
                parse_dependency(data, parsed_schema)
            elif type_id.isdigit():
                parse_topic(type_id, data, parsed_schema)
            elif type_id == MANDATORY_Q or type_id == CONTINGENT_Q:
                parse_question(data, type_id == CONTINGENT_Q, 
                               parsed_schema)
            elif is_answer(type_id):
                parse_answer(type_id, data, parsed_schema)
    return parsed_schema

def parse_title(title, output):
    output['title'] = title

def parse_parent(parent, output):
    output['parent'] = parent

def parse_instructions(instructions, output):
    output['instructions'] = instructions

def parse_glossary(glossary_entry, output):
    term, definition = glossary_entry.split(':', 1)
    output['glossary'][term.strip()] = definition.strip()


def clean_answer_id(answer):
    answer = answer.split(' ')[2].strip(',')
    if answer != '*': # * represents any answer
        answer = ord(answer) - 96
    return answer

def parse_dependency(dependency, output):
    source_topic_id = output['topics'][-1]['id']
    source_question_id = output['topics'][-1]['questions'][-1]['question_number']
    source_answer_id, target_question = [x.strip() for x in 
                                         dependency.split(DEPENDENCY_TARGET, 1)]
    source_answer_id = clean_answer_id(source_answer_id)
    target_question = int(target_question)
    output['dependencies'].append(Dependency(source_topic_id, 
                                             source_question_id, 
                                             source_answer_id, target_question))

def parse_topic(topic_id, data, output):
    if 'topics' not in output:
        output['topics'] = []
    output['topics'].append({
        'id': int(topic_id),
        'name': data.strip(),
        'questions': [],
    })

def parse_question(question, contingency, output):
    topic = output['topics'][-1]
    question_number, question_type, question_text = question.split(None, 2)
    topic['questions'].append({
        'question_number': int(question_number),
        'question_text': question_text,
        'type': question_type,
        'contingency': contingency,
        'answers': [],
    })

def parse_answer(answer_number, answer, output):
    question = output['topics'][-1]['questions'][-1]
    question['answers'].append({
        'answer_number': ord(answer_number) - 96,
        'answer_content': answer,
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
