variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_access_key_id" {
  description = "AWS access key ID"
  type        = string
  # sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS secret access key"
  type        = string
  # sensitive   = true
}

variable "cidr_block_vpc" {
  type       = string
  default    = "10.0.0.0/16"
}

variable "ami_ssm_path" {
  type       = string
  default    = "/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"
}

variable "instance_type" {
  type       = string
  default    = "t2.micro"
}

variable "supabase_url" {
  description = "Supabase URL"
  type       = string
}

variable "supabase_key" {
  description = "Supabase anon key"
  type       = string
}