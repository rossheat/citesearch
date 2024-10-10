#!/usr/bin/env python3
import os
from aws_cdk import App, Stack, Duration
from aws_cdk import (
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_elasticloadbalancingv2 as elbv2,
    aws_route53 as route53,
    aws_route53_targets as targets,
    aws_certificatemanager as acm,
)
from constructs import Construct

class CiteSearchStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        vpc = ec2.Vpc(self, "CiteSearchVPC", max_azs=2)

        # ECS 
        cluster = ecs.Cluster(self, "CiteSearchCluster", vpc=vpc)

        task_definition = ecs.FargateTaskDefinition(
            self, "CiteSearchTaskDef",
            cpu=256,
            memory_limit_mib=512,
            runtime_platform=ecs.RuntimePlatform(
                operating_system_family=ecs.OperatingSystemFamily.LINUX,
                cpu_architecture=ecs.CpuArchitecture.ARM64
            )
        )

        container = task_definition.add_container(
            "CiteSearchContainer",
            image=ecs.ContainerImage.from_asset(".."),
            port_mappings=[ecs.PortMapping(container_port=80)],
            logging=ecs.LogDrivers.aws_logs(stream_prefix="CiteSearch"),
            stop_timeout=Duration.seconds(120)
        )

        zone = route53.HostedZone.from_hosted_zone_attributes(self, "HostedZone",
            hosted_zone_id="Z05895862C03P7C2NRMRA",
            zone_name="citesearch.org"
        )

        certificate = acm.Certificate(self, "Certificate",
            domain_name="citesearch.org",
            validation=acm.CertificateValidation.from_dns(zone)
        )

        fargate_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "CiteSearchService",
            cluster=cluster,
            task_definition=task_definition,
            desired_count=1,
            listener_port=443,
            domain_name="citesearch.org",
            domain_zone=zone,
            certificate=certificate,
            assign_public_ip=True,
            public_load_balancer=True,
            health_check_grace_period=Duration.seconds(300) 
        )

        fargate_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200",
            interval=Duration.seconds(60),
            timeout=Duration.seconds(30) 
        )

        # Increase ALB idle timeout
        fargate_service.load_balancer.set_attribute(
            "idle_timeout.timeout_seconds", "300"
        )

        # Redirect HTTP to HTTPS
        fargate_service.load_balancer.add_listener(
            "HttpListener",
            port=80,
            default_action=elbv2.ListenerAction.redirect(
                protocol="HTTPS",
                port="443"
            )
        )

app = App()
CiteSearchStack(app, "CiteSearchStack")
app.synth()