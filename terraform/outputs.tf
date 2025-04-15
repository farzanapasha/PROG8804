output "ecr_repo_urls" {
  description = "Map of ECR repository names to their URLs"
  value       = {
    for repo_name, repo in aws_ecr_repository.main : repo_name => repo.repository_url
  }
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

# Output the ARN of the IAM role to use in GitHub Actions
output "github_actions_ecr_role_arn" {
  value = aws_iam_role.github_actions_ecr.arn
}
