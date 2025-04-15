resource "aws_ecr_repository" "final-repo" {
  name = "final-repo"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "final-repo"
  }
}