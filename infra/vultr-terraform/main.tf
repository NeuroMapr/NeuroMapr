# Vultr Infrastructure as Code for NeuroMapr
# This Terraform configuration automates Vultr service deployment

terraform {
  required_providers {
    vultr = {
      source  = "vultr/vultr"
      version = "~> 2.0"
    }
  }
}

provider "vultr" {
  api_key = var.vultr_api_key
}

# Variables
variable "vultr_api_key" {
  description = "Vultr API Key"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "Vultr region"
  type        = string
  default     = "ewr" # New Jersey
}

variable "db_password" {
  description = "PostgreSQL database password"
  type        = string
  sensitive   = true
}

variable "redis_password" {
  description = "Valkey (Redis) password"
  type        = string
  sensitive   = true
}

# PostgreSQL Managed Database
resource "vultr_database" "neuromapor_postgres" {
  database_engine         = "pg"
  database_engine_version = "16"
  region                  = var.region
  plan                    = "vultr-dbaas-startup-cc-1-55-2"
  label                   = "neuromapor-postgres-db"
  
  maintenance_dow         = "sunday"
  maintenance_time        = "03:00"
  
  trusted_ips = [
    "0.0.0.0/0" # Update with your specific IPs in production
  ]
}

# Valkey (Redis-compatible) Database
resource "vultr_database" "neuromapor_valkey" {
  database_engine         = "redis"
  database_engine_version = "7"
  region                  = var.region
  plan                    = "vultr-dbaas-startup-cc-1-55-2"
  label                   = "neuromapor-valkey-cache"
  
  maintenance_dow         = "sunday"
  maintenance_time        = "04:00"
  
  trusted_ips = [
    "0.0.0.0/0" # Update with your specific IPs in production
  ]
}

# Object Storage
resource "vultr_object_storage" "neuromapor_storage" {
  cluster_id = 2 # New Jersey cluster
  label      = "neuromapor-media-storage"
}

# Outputs
output "postgres_host" {
  value       = vultr_database.neuromapor_postgres.host
  description = "PostgreSQL database host"
}

output "postgres_port" {
  value       = vultr_database.neuromapor_postgres.port
  description = "PostgreSQL database port"
}

output "postgres_user" {
  value       = vultr_database.neuromapor_postgres.user
  description = "PostgreSQL database user"
}

output "postgres_password" {
  value       = vultr_database.neuromapor_postgres.password
  description = "PostgreSQL database password"
  sensitive   = true
}

output "valkey_host" {
  value       = vultr_database.neuromapor_valkey.host
  description = "Valkey (Redis) host"
}

output "valkey_port" {
  value       = vultr_database.neuromapor_valkey.port
  description = "Valkey (Redis) port"
}

output "valkey_password" {
  value       = vultr_database.neuromapor_valkey.password
  description = "Valkey (Redis) password"
  sensitive   = true
}

output "s3_endpoint" {
  value       = vultr_object_storage.neuromapor_storage.s3_hostname
  description = "Object Storage S3 endpoint"
}

output "s3_access_key" {
  value       = vultr_object_storage.neuromapor_storage.s3_access_key
  description = "Object Storage access key"
  sensitive   = true
}

output "s3_secret_key" {
  value       = vultr_object_storage.neuromapor_storage.s3_secret_key
  description = "Object Storage secret key"
  sensitive   = true
}
