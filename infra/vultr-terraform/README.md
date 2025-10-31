# Vultr Terraform Automation

This directory contains Terraform configuration to automatically provision all Vultr infrastructure for NeuroMapr.

## Prerequisites

1. Install Terraform: https://www.terraform.io/downloads
2. Get your Vultr API key from: https://my.vultr.com/settings/#settingsapi

## Quick Start

```bash
# 1. Copy the example variables file
cp terraform.tfvars.example terraform.tfvars

# 2. Edit terraform.tfvars with your Vultr API key and passwords
# Use a text editor to fill in your values

# 3. Initialize Terraform
terraform init

# 4. Preview what will be created
terraform plan

# 5. Create the infrastructure
terraform apply

# 6. View outputs (connection details)
terraform output
```

## What Gets Created

- PostgreSQL 16 Managed Database (1GB RAM, 25GB storage)
- Valkey (Redis 7) Cache (1GB RAM)
- Object Storage with S3-compatible API

## Getting Connection Details

After `terraform apply` completes, get your credentials:

```bash
# View all outputs
terraform output

# Get specific values
terraform output postgres_host
terraform output -raw postgres_password
terraform output -raw s3_access_key
```

## Updating Your .env File

After deployment, update `backend/.env` with the Terraform outputs:

```bash
# Run this script to auto-populate (or do it manually)
echo "VULTR_DB_HOST=$(terraform output -raw postgres_host)" >> ../backend/.env
echo "VULTR_DB_PORT=$(terraform output -raw postgres_port)" >> ../backend/.env
echo "VULTR_DB_PASSWORD=$(terraform output -raw postgres_password)" >> ../backend/.env
# ... etc
```

## Destroying Infrastructure

To tear down all resources (be careful!):

```bash
terraform destroy
```

## Cost

Estimated monthly cost: ~$35-40 USD

## Security Notes

- Never commit `terraform.tfvars` (already in .gitignore)
- Update `trusted_ips` in main.tf to restrict database access
- Rotate passwords regularly
