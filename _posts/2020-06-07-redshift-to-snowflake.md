---
layout: post
title: "Migrating from Redshift to Snowflake"
image: "/images/posts/redshift-to-snowflake/heading.png"
tags:
  - data
  - snowflake
  - featured
---
Redshift is awesome, but we needed to move forward. It was a huge challenge and here's how we
managed to do it.

## The backstory

I joined Receipt Bank as a software developer about three years ago. My last onboarding task gave me
a good overview on the data flow and I was offered to join the data engineering team shortly after I
finished my onboarding. I haven't had prior experience in this area, but I was keen to learn more,
so I happily accepted.


## Redshift

Like many other companies, we use every AWS service we can, so it shouldn't surprise you we used
[Redshift](https://aws.amazon.com/redshift/) as a warehousing solution. Redshift is actually
awesome. It's an easy and cheap way to start when you need a data warehouse, not to mention it's
based on the good old PostgreSQL.

There are two types of Redshift [cluster
nodes](https://docs.aws.amazon.com/redshift/latest/mgmt/working-with-clusters.html) —
compute-optimized with small SSDs, and storage optimized with large HDDs. We started with 10
`dc2.large` (dense compute) machines which served us well for a while.

The project was adopted rather well and our data volumes were increasing fairly quickly. We had to
add new nodes every few months and two years later we hit the limit of 32 compute machines.
Unfortunately, we can't mix compute and storage nodes and our only option was to switch to the
larger disks. Of course, we'd seen that coming and started preparing upfront. We secured some time
by migrating to a cluster with a few `ds2.xlarge` workers and caching the most used queries with
[dbt](https://www.getdbt.com/) transformations. We had the memory and CPU to run our reports at a
reasonable speed, and the space to switch to [Snowflake](https://www.snowflake.com/).

## Snowflake

You can often hear people talk about it as a warehouse build for the cloud, but what does that mean?
Snowflake works on (at least) the three major providers AWS, GCP and Azure and it's up to you to
choose the provider and availability zone for your setup. Just keep in mind Snowflake is a managed
service, so you don't have access to the underlying resources and the choice could affect the
traffic costs for your cloud provider.

Snowflake is not an AI-Blockchain-NoSQL-Graph database. In fact, on the first look it looks like a
traditional PostgreSQL, but don't let the familiar syntax and intuitive UI lie to you. Snowflake is
a completely separate warehouse built from the ground up. Snowflake has separated their computing
from the storage. It's like having two separate computers which you can access through the local
network. If you need more storage for your multimedia, you upgrade one, and if you need more power
for your games, you upgrade the other.

I won't talk too much about Snowflake, as there are tons of resources out there, but I'd say it's
pretty damn good!

## Migration

### ETL

Our first step was to migrate our ETL, and as most of our data infrastructure, it was highly coupled
to AWS. It cost us some time for planning and quite some time for execution, but once we ran it, it
worked like a charm. Here's what we've done.

### Defined critical metrics

We started by defining the most important criteria for success. We created a
[Looker](https://looker.com/) dashboard with looks for the average query runtime and the percentage
percentage of __fast__ queries and list of slow queries. The results in this dashboard was one of
the top criteria we'd use for our buy/no-buy decision.

### Created a Snowflake adapter for the ETL

Our [PySpark](https://spark.apache.org/) ETL was working for years and we were planning to continue
supporting Redshift for a few months after the official migration. The plan was to run the ETL both
for Redshift and Snowflake.

We started by creating a Snowflake adapter with the same _public API_ we had for Redshift and
wrapped all of this with a [Strategy](https://en.wikipedia.org/wiki/Strategy_pattern) class.

Leaving pipelines like that would create various problems for us. We wanted to feed Redshift and
Snowflake independently, so if the load fails for one warehouse it still could pass for the other.
Of course, we didn't want to run the extractions and transformations twice and pay twice for the
same task.

We end up splitting every pipeline into three separate jobs. One job running just the ET and
producing CSV files in [S3](https://aws.amazon.com/s3/), one loading CSVs into Redshift and one
loading the same data into Snowflake.

Decoupling the pipelines took us some time but made maintenance much easier. Not to mention shutting
down Redshift pipelines in a later stage.

### Write migration scripts

This, in my opinion, was one of the most challenging technical aspects of the project. We created a
couple of scripts for that purpose. The idea was to make something that could _crawl_ the database,
and allow us to add new data in Redshift while working on the migration without hardcoding schemas,
tables and views.

With the first script, we were able to copy the structure of the Redshift database into Snowflake.
It basically listed all schemas with all tables and views in them and generated `CREATE` queries.
The last job of this script was to set proper for permissions for every asset.

With the second script, we could copy the data from one warehouse to the other. It was as simple as
dumping all the data in CSV files in S3 and then copy this data into Snowflake.

It doesn't look like a hard task, but a lot is going on here. First of all, we need to make sure we
don't miss any table, view or whatever we want to recreate into Snowflake. We also should keep in
mind, that Redshift and Snowflake have slightly different syntax and the DDL doesn't match. That
means we can't just get the one provided by Redshift and we have to generate it for ourselves.

Unloading and copying data normally is a trivial task. The complication in our case came from the
way we use our warehouses. We have people working in (almost) all timezones who need almost live
data and every hour without this data makes them blind. This means we had to find a good balance
between quick parallel dumps and enough power to run `SELECT` queries.

### Run the migration

So we prepared and tested everything. It was the time to run the migration.

One day (or rather one night) we stopped the ETL including our internal Spark pipelines as well the
syncs from [Segment](https://segment.com/) and [Fivetran](https://fivetran.com/). Then, we started
our migration scripts and a few hours later when everything finished (surprisingly without any
errors) we started the ETL with Snowflake support.

## Epilogue

So, almost one year after the migration, I'd say it was a fairly successful project. We did well and
secured virtually unlimited storage and computing power. We moved our transformations entirely to
dbt and increased the data volumes tens of times since then.

It's important to say we pay much more for Snowflake than what we have been paying for Redshift, but
it works well for our use-case.

What are your thoughts?

