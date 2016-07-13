import copy
import json
import os
from parse_schema import parse_schema
from parse_document import parse_document

SAMPLE_TYPE = 'Protester'
SAMPLE_DOC = 'DecidingForceArticles/176Albany, NY-theassociatedpressstatelocalwire-09.txt'

def data_to_sample_json(schema, document, sample_type):
    samples = []
    j = {}
    j['glossary'] = schema['glossary']

    j['topics'] = []
    for topic_id, topic in schema['topics'].iteritems():
        new_topic = {}
        new_topic['id'] = topic_id
        new_topic['name'] = topic['name']
        new_topic['questions'] = []
        for question_id, question in topic['questions'].iteritems():
            full_question_id = '%s.%s' % (topic_id, question_id)
            q_dependencies = [(dep[0].replace('.any', ''), dep[1])
                              for dep in schema['dependencies']
                              if dep[0].startswith(full_question_id)]
            new_question = {}
            new_question['id'] = full_question_id
            new_question['top'] = (full_question_id not in
                                   [dep[1] for dep in schema['dependencies']])
            new_question['text'] = question['text']
            new_question['type'] = question['type']

            new_question['answers'] = []
            for answer_id, answer in question['answers'].iteritems():
                full_answer_id = '%s.%s' % (full_question_id, answer_id)
                new_answer = {}
                new_answer['id'] = full_answer_id
                new_answer['text'] = answer['text']
                new_question['answers'].append(new_answer)

            new_question['dependencies'] = [{'if': dep[0], 'then': dep[1]}
                                            for dep in q_dependencies]
            new_topic['questions'].append(new_question)
        j['topics'].append(new_topic)

    j['text'] = document['text']
    raw_tuas = document['tuas'][sample_type]
    for tua_id, tua in raw_tuas.iteritems():
        new_tua = {}
        new_tua['id'] = tua_id
        new_tua['type'] = sample_type
        new_tua['instructions'] = schema['instructions']
        new_tua['offsets'] = [{'start': off[0], 'stop': off[1]}
                          for off in tua]
        sample = copy.deepcopy(j)
        sample['tua'] = new_tua
        samples.append(sample)
    return samples

if __name__ == '__main__':
    sample_schema = parse_schema()
    sample_doc = parse_document(SAMPLE_DOC)
    samples = data_to_sample_json(sample_schema, sample_doc, SAMPLE_TYPE)
    for i, sample in enumerate(samples):
        fname = '%s_%d.json' % (os.path.splitext(os.path.basename(SAMPLE_DOC))[0], i)
        with open(fname, 'w') as outf:
            json.dump(sample, outf)
