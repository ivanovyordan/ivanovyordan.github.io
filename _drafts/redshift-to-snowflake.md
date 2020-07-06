---
layout: post
title: Migrating from Redshift to Snowflake
image: assets/images/posts/redshift-to-snowflake/heading.png
lang: en-US
---

## Intro

I joined Receipt Bank 3 years ago and I spent my onboarding working on the main web application. My
last onboarding task was to do some refactoring on our [Segment](https://segment.com/) events. This
gave me some good overview on part of our data flow so after that I was offered to join the data
engineering team, which I happily accepted.

As most teams in the company, we heavily rely on AWS for everything. I won't speak too much about
our stack as it could take a whole new post. The important bit here is we used [AWS
Redshift](https://aws.amazon.com/redshift/).

## Redshift

Redshift is really awesome. It's an easy and cheap way to start when you need a data warehouse.
Moreover, if you like us already have build your infrastructure in AWS.

The whole project started a few months before I join the company and as I already said, we rely on
AWS about every piece of infrastructure.

There are two types of Redshift nodes — compute optimized with small disks, and storage optimized
with slow disks.

We started with 10 `dc2.large` (dense compute) nodes which served us well for a while. With the need
for more analysis the data started increasing quickly. We had to add new nodes every few months.

Every upgrade took us between 5 and 8 hours, as AWS have to spin a completely new cluster and
transfer the data between the old and the new one. That means 5-8 hours in read-only warehouse, or
5-8 hours blindness for the teams who rely on live data. Now add a some more time to catch-up with
the data and you will understand how much impact every upgrade had.

Two years later we hit the limit of 32 compute machines and since we can't mix compute and storage,
we had to switch to the large disks. Of course, we'd seen that coming and started preparing. We
adopted a project called [dbt](https://www.getdbt.com/). The idea behind dbt is quite simple, you
write some SQL select statements and end up with tables and views full of data. I won't spoil you
too much, but nowadays dbt is one of my favorite projects to work with.

We already knew Redshift might not be the best solution for us, but we managed to secure some time
by migrating to a cluster with a few `ds2.xlarge` nodes and caching the most used reports with dbt
transformations. We had the memory and CPU to run our reports at a reasonable speed, and the space
to migrate entirely on dbt. But still, we weren't satisfied by the speed, mostly caused by the long
queue of waiting queries.

## Snowflake

We have been considering Snowflake previously, but admittedly, I didn't have the time or even the
"voice" to look for alternatives and play with them. dbt bought us this time.

So, what is [Snowflake](https://www.snowflake.com/)? You can often hear people talk about it as a
warehouse build for the cloud, but what does that mean? Snowflake works on (at least) the three
major cloud providers AWS, GCP and Azure and it's up to you to choose which provider and
availability zone to be used four your setup. Just keep in mind Snowflake is a managed service, so
you don't have access to the underlying resources. Placing your warehouse in the same AZ would mean
free traffic for your data, which otherwise could cost you a significant about of money.

Snowflake is not another NoSQL, or even Graph database, it's not event based or ML-enabled. In fact,
on the first look it looks like a traditional PostgreSQL, but don't let the familiar syntax lie to
you, the real magic is under the hood.

Snowflake have separated their computing from their storage. This means they can scale
independently. You can imagine having a media center at your home. You can add as many disks there
without having to upgrade your laptop or phone.

Let me start with the storage. It's dirty cheap and literally infinite! When in AWS, Snowflake uses
S3 which you might already have head of - it's basically the standard for cloud storage. Just like
if it was your S3 you only pay **$23 per GB** of used space.


## Migration

How we migrated
