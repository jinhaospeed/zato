# Generated by the protocol buffer compiler.  DO NOT EDIT!

from google.protobuf import descriptor
from google.protobuf import message
from google.protobuf import reflection
from google.protobuf import descriptor_pb2
# @@protoc_insertion_point(imports)


DESCRIPTOR = descriptor.FileDescriptor(
  name='scheduler.proto',
  package='zato.scheduler',
  serialized_pb='\n\x0fscheduler.proto\x12\x0ezato.scheduler\"U\n\x06\x43reate\x12\x0c\n\x04name\x18\x01 \x02(\t\x12\x11\n\tis_active\x18\x02 \x02(\x08\x12*\n\x08job_type\x18\x03 \x02(\x0e\x32\x18.zato.scheduler.JOB_TYPE*<\n\x08JOB_TYPE\x12\x0c\n\x08one_time\x10\x00\x12\x12\n\x0einterval_based\x10\x01\x12\x0e\n\ncron_style\x10\x02')

_JOB_TYPE = descriptor.EnumDescriptor(
  name='JOB_TYPE',
  full_name='zato.scheduler.JOB_TYPE',
  filename=None,
  file=DESCRIPTOR,
  values=[
    descriptor.EnumValueDescriptor(
      name='one_time', index=0, number=0,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='interval_based', index=1, number=1,
      options=None,
      type=None),
    descriptor.EnumValueDescriptor(
      name='cron_style', index=2, number=2,
      options=None,
      type=None),
  ],
  containing_type=None,
  options=None,
  serialized_start=122,
  serialized_end=182,
)


one_time = 0
interval_based = 1
cron_style = 2



_CREATE = descriptor.Descriptor(
  name='Create',
  full_name='zato.scheduler.Create',
  filename=None,
  file=DESCRIPTOR,
  containing_type=None,
  fields=[
    descriptor.FieldDescriptor(
      name='name', full_name='zato.scheduler.Create.name', index=0,
      number=1, type=9, cpp_type=9, label=2,
      has_default_value=False, default_value=unicode("", "utf-8"),
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='is_active', full_name='zato.scheduler.Create.is_active', index=1,
      number=2, type=8, cpp_type=7, label=2,
      has_default_value=False, default_value=False,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
    descriptor.FieldDescriptor(
      name='job_type', full_name='zato.scheduler.Create.job_type', index=2,
      number=3, type=14, cpp_type=8, label=2,
      has_default_value=False, default_value=0,
      message_type=None, enum_type=None, containing_type=None,
      is_extension=False, extension_scope=None,
      options=None),
  ],
  extensions=[
  ],
  nested_types=[],
  enum_types=[
  ],
  options=None,
  is_extendable=False,
  extension_ranges=[],
  serialized_start=35,
  serialized_end=120,
)


_CREATE.fields_by_name['job_type'].enum_type = _JOB_TYPE

class Create(message.Message):
  __metaclass__ = reflection.GeneratedProtocolMessageType
  DESCRIPTOR = _CREATE
  
  # @@protoc_insertion_point(class_scope:zato.scheduler.Create)

# @@protoc_insertion_point(module_scope)
