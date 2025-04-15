variable "aws_region" {
  default = "us-east-1"
}

variable "ecr_repo" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["backend-api", "frontend-app", "worker-service"]
}

variable "github_user_or_org" {
  description = "GitHub user or organization"
  type        = string
  default     = "github"
}

variable "repo_name" {
  description = "GitHub repository name"
  type        = string
  default     = "repo-name"
}
