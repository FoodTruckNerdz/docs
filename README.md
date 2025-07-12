# Documentation

> [!Note]
> I may have misunderstood the purpose of creating a `docs` repository in our organization. One way to look at it is: we only need a docs repository if we are publishing docs for users of our software. Our developer documentation might be better off in the Wiki section of the `FoodTruckNerdz` repository.

This repository contains extended documentation in any number of formats.

To start developing with FoodTruckNerdz go to the organization's [Profile page](<https://www.github.com/FoodTruckNerds/>) on GitHub.

- The `obsidian` folder is an Obsidian notebook. We will be moving away from Obsidian, due to its proprietary nature.
- There are various documentation apps and frameworks that produce static doc websites from Markdown content. That is the kind of thing we are aiming to use. Chances are we will use Docusaurus. If not Docusaurus, then an older project called Jekyll will be good. Jekyll is written in Ruby, which is not a fast language. If we like its format, we should consider Hakyll (a Haskell-based rewrite of Ruby).
