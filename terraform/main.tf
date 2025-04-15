provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

# ECR repository
resource "aws_ecr_repository" "main" {
  for_each             = toset(var.ecr_repo)
  name                 = each.key
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = each.key
    Environment = "dev"
    CreatedBy   = "terraform"
  }
}

# OpenID Connect Provider for GitHub
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1"
  ]
}

resource "aws_iam_role" "github_actions_ecr" {
  name = "GitHubActionsECRPushRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        },
        Action = "sts:AssumeRoleWithWebIdentity",
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_user_or_org}/${var.repo_name}:*"
          }
        }
      }
    ]
  })

  tags = {
    Name = "GitHubActionsECRPushRole"
  }
}

# IAM Role Policy to allow GitHub Actions to interact with ECR
resource "aws_iam_role_policy" "github_actions_ecr_policy" {
  for_each = toset(var.ecr_repo)

  name   = "ecr-push-policy-${each.key}"
  role   = aws_iam_role.github_actions_ecr.name
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = "ecr:GetAuthorizationToken",
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ],
        Resource = "arn:aws:ecr:${var.aws_region}:${data.aws_caller_identity.current.account_id}:repository/${each.key}"
      }
    ]
  })
}

