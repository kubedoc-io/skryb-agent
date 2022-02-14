# Skryb Agent

Skryb is responsible for extraction of Kubernetes cluster(s) data, applying mapping rules to produce meta-model entities. These entities are then sent to
one or more metamodel feeders, which will apply the detected changes to the single metamodel instance and notify all interested parties. 

## Skryb Operator

Responsible for reading the configuration and watching the cluster(s). 

## Skryb Parser

Responsible for applying parsing rules to the received resources and produce one or more mutations

## Skryb Metamodel

A metamodel exposes an API to receive mutations, execute queries and propagate changes. 


## Configuration

- clusters
- documented resources
- external services (git, jira, etc)
- metamodel type (local db, secure cloud, custom)
- communication hub
- identity provider

## Builtin Rulesets

Rules are simple functions receiving one or more Kubernetes resources (filtering using label or annotation selectors) and transform them into
one or more meta-model mutation. These mutations are then sent to metamodel feeder, which will sequentially reduce these mutations into the core
metamodel. Resulting changes to the metamodel are propagated through the configured communication hub (rabbitmq, nats, redis pub/sub, etc.)





### Definining Rulesets


## Model

- organization
- system
- subsystem
- domain
- 


## References

https://kubernetes.io/docs/reference/labels-annotations-taints/
https://ambassadorlabs.github.io/k8s-for-humans/
https://backstage.io/docs/features/software-catalog/well-known-annotations
https://backstage.io/docs/features/software-catalog/well-known-relations
