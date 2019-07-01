---
layout: post
title: SVN to Git write-up
image: https://images.unsplash.com/photo-1531030874896-fdef6826f2f7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80
unsplash_author: Pankaj Patel
unsplash_image: ZV_64LdGoao
lang: en-US
tags:
  - git
  - write-up
  - featured
---
## The backstory
I left my previous job about two years ago. As a small team in a single room, we didn't have significant problems with
the communication. Surprisingly the choice of tooling and the way we were using it caused us our biggest problems.

## The process
As a product company, most of the time we were working on a single monolithic project with multiple smaller
applications divided in SVN repositories. There's nothing unusual for a dozen years old product. But here's how we
were using SVN.

There was no branching, real _staging_ environment or automated deployment. If we wanted to deploy a
piece of code, we had to commit it to master. Then thanks to some cron job magic it was deployed to
the staging server. When we wanted to ship a feature, we had to ask the _CTO_ to run `svn up` on the single production
server.

## The problems
Let me give you an example of a situation we had almost every day.

If George wants to test something on _integration_, he must commit his code to the _master_ branch. A few minutes later
Mary is done with her feature which is already in _master_. Peter logs in to the server and updates
the _master_ branch on the server. Guess what happens at that moment? Peter just deployed George's buggy and unpolished
code.

What was our workaround? We had to ask out loud in the room:

> Is there something in the repository that should not be deployed?

And if the answer was `Yes` we had to upload the specific feature files, revert the changes or even wait for each other
to finish with our work.

## The solution
We knew that we had a major problem with our workflow. The obvious solution was to fix our workflow and keep the good
old SVN. Surprisingly we did not do that. My proposition was to migrate to Git.

I was a fan of [GitHub](https://github.com/) for open source projects. I've also used
[BitBucket](https://bitbucket.org/) for a couple of closed source ones. Using these tools helped me collaborate much
better with my peers and automate my processes. Unfortunately, both platforms were incompatible with the requirements
of my boss. He demanded a self-hosted solution because he was afraid that the service providers
could steal our code :smile:.

We installed [GitLab](https://about.gitlab.com/) on one of our servers shortly after I started complaining about the
process. The process was manual and tedious but the documentation was good and we did it without any significant
problems.

GitLab was looking great for us but we didn't start using it. There was always something more important at the moment.
It took me literally two years of _negotiations_ to start working on the migrations from SVN to Git.

One day I organized a Q&A session between the CTO, CEO and me. We started with a _short presentation_ of some Git
features and how the migration would improve our process. There were a lot of questions from their side. The CEO was
concerned about the time it would take us to migrate. The CTO, on the other hand, didn't know if we can preserve the
history from SVN. In my opinion, the CTO was used to the process and tooling and was afraid of the change.

I showed [git-svn](https://git-scm.com/docs/git-svn) to the management and gave them a rough estimation of 3 weeks for the
migration. Shortly after that, we started working on the real migration.

## The migration
Our first step was to set up a new GitLab instance. There was an
[Omnibus](https://docs.gitlab.com/omnibus/) package that made installation and setup so much easier. We created a new
virtual machine and installed the package. The documentation was even better.

The migration of the test project went good, but I was frustrated when I started exploring all of our projects. As I
already said it seemed no one tried to learn how to work with SVN the _right way_. Only a few of the applications were
using the standard SVN structure. Many of the projects were sharing a single repository and were separated only by
their directories.

There were two directories in the repository of the main application. The one we checked out was the
_current_ version of the project (version here means rewrite). The other directory was containing
one of the _previous versions_. We also had a couple of other repositories for different old versions of the projects. I
even found a repository that was unknown to everyone. All these versions had their own history despite they were
representing different stages of the evolution of the same project.

## The automation
Off course we didn't migrate about a hundred repositories by hand. I described the structures of repositories and
branches I wanted to achieve. Every project and branch had multiple fields like repository/branch name, SVN path,
GitLab visibility and so on.

The rest was pretty easy. The main script executed a couple of shell commands and GitLab API calls. Every SVN
repository was cloned and converted to a Git repository with all the history (commits, messages, and authors), ignored
files and directories branches and everything we needed and the repository was pushed to a project created using the
API.

## The new workflow
As expected learning the new tool was not easy and took us about a month to get used to it and the workflow, but it
worth it. The process itself was nothing special. We were using GitLab for tracking issues, discussing issues and
features, tracking milestones progress and everything else. Besides the better visibility of our progress we got two
huge benefits:

- Code reviews. They helped us improve our hard and soft skills so much.
- Feature branches. We were able to test every feature without the risk of deploying it to production.

## The lessons
**Know your tooling**<br>
It may be your editor, your version control system or your hammer. No matter what's your tool of choice, learn how to
use it beyond the basics. If people who were responsible for our SVN repositories read just a bit about SVN
functionalities we could have branches and code reviews for years and the migration could be even easier if ever
happened. After all, tooling is what makes us productive.

**Do not be afraid of change**<br>
Change might be scary sometimes. It's natural for people to be afraid of the unknown, but it shouldn't prevent
progress. We should look into our problems objectively, write them down, search for solutions and estimate the effort.
Humans are supposed to be intelligent spices after all.

What's your opinion?
