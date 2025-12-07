# Changelog

## Features

- **bedrock-kb-retrieval-mcp-server**: Added 'description' field to responses for list_knowledge_bases_tool (#1399) (#1399)
- **aws-api-mcp-server**: Add MCPClient and via to user agent (#1724) (#1724)
- **samples/cloudwatch-applicationsignals-mcp**: add docker java springboot app (#1717) (#1717)
- **samples/cloudwatch-applicationsignals-mcp**: add docker nodejs express app (#1721) (#1721)
- **samples/cloudwatch-applicationsignals-mcp**: add docker python django app (#1723) (#1723)
- **samples/cloudwatch-applicationsignals-mcp**: add ecs terraform samples for enablement testing (#1730) (#1730)
- **samples/cloudwatch-applicationsignals-mcp**: add ecs samples for enablement testing (#1727) (#1727)
- **samples/cloudwatch-applicationsignals-mcp**: add ec2 terraform docker infra (#1726) (#1726)
- **evals**: enhance framework with validation, discovery, and reliability improvements (#1735) (#1735)
- Add investigation tasks evaluation framework for Application Signals MCP (#1736) (#1736)
- **document-loader-mcp-server**: Add Document Loader MCP Server (#1379) (#1379)
- **cicd**: merge holds through label or repository variable (#1750) (#1750)
- Batch audit services using API pagination (#1766) (#1766)
- **cloudwatch-applicationsignals-mcp-server**: add ec2-python enablement guide (#1765) (#1765)
- **cloudwatch-applicationsignals-mcp-server**: add ec2-java enablement guide (#1775) (#1775)
- **cloudwatch-applicationsignals-mcp-server**: add ec2-nodejs enablement guide (#1776) (#1776)
- Audit instrumented services only (#1767) (#1767)
- **aws-pricing-mcp-server**: Add support for FlatRate term and pricing alternatives (#1783) (#1783)
- **cloudwatch-applicationsignals-mcp-server**: add ECS java/python/nodejs enablement guides (#1779) (#1779)
- **cloudwatch-applicationsignals-mcp-server**: add eks java/python/nodejs enablement guides (#1777) (#1777)
- **cloudwatch-applicationsignals-mcp-server**: Add Java/Nodejs/Python/.NET Enablement guides for Lambda (#1782) (#1782)
- **aws-api-mcp-server**: allow disabling local file system access (#1774) (#1774)
- **dynamodb**: Create dynamodb data model validation tool (#1648) (#1648)
- agentcore runtime, gateway, and memory tools (#1687) (#1687)
- **ecs-mcp-server**: add tool filtering for AWS Knowledge proxy and update integ tests (#1795) (#1795)
- Increase page size of pricing.get_attribute_values to 10000 (#1794) (#1794)
- **cloudwatch-applicationsignals-mcp-server**: support code-level attributes (#1799) (#1799)
- **aws-iac-mcp-server**: add new IaC MCP server (#1762) (#1762)
- **aws-iac-mcp-server**: add new cdk search tool (#1805) (#1805)
- **cloudwatch-applicationsignals-mcp-server**: Adding .NET Enablement guide for EKS/ECS (#1803) (#1803)
- **ecs-mcp-server**: add ECS Express Mode deployment support (#1810) (#1810)
- add knowledge base proxy (#1801) (#1801)
- **cloudwatch-applicationsignals-mcp-server**: add ec2-dotnet enablement guide (#1807) (#1807)
- Amazon SageMaker AI MCP Server (#1814) (#1814)
- **iac-mcp-server**: adding more cdk tools for iac mcp (#1815) (#1815)
- **aws-iac-mcp-server**: CDK best practices tool (#1832) (#1832)
- **aws-iac-mcp-server**: rename two CFN tools to follow naming consistency, add new context accessible as a tool (#1836) (#1836)
- updating iac mcp server related readme (#1849) (#1849)
- **aws-network**: add aws-network-mcp-server (#1790) (#1790)
- changed read doc tool to reflect it's generic purpose (#1860) (#1860)

## Bug Fixes

- **samples/cloudwatch-applicationsignals-mcp**: add cdk-stack.ts in Application Signals ecs sample (#1747) (#1747)
- **healthomics**: Code scanning/7942 (#1751) (#1751)
- **aws-location**: Add missing coordinate retrieval functionality (#1769) (#1769)
- **aws-api-mcp-server**: provide fastmcp settings in `run` (#1772) (#1772)
- **samples/cloudwatch-applicationsignals-mcp**: Display a notice in the Application Signals enablement completion (#1788) (#1788)
- codeowners and file path (#1802) (#1802)
- add CFN guard file types to the header (#1804) (#1804)
- **s3-tables-mcp**: fix time parsing (#1816) (#1816)
- Update README.md hyperpod doc link (#1826) (#1826)
- Update pyproject.toml server path (#1831) (#1831)
- update consts.py supported_regions (#1838) (#1838)
- **aws-iac-mcp-server**: updated CDK best practices wording to prevent tool execution failure (#1847) (#1847)
- **dynamodb-mcp-server**: use explicit workspace_dir parameter for validation file paths (#1844) (#1844)
- **aws-api-mcp-server**: origin header parsing (#1851) (#1851)
- **aws-iac-mcp-server**: renaming some read tool calls and suggestions in description to … (#1868) (#1868)

## Documentation

- **aws-api-mcp-server**: Add AgentCore Runtime deployment guide for AWS API MCP Server (#1716) (#1716)
- **cloudwatch-applicationsignals-mcp-server**: Add Kiro installation… (#1812) (#1812)
- **ecs-mcp-server**: fix readme (#1819) (#1819)
- add vibe coding workshop link (#1797) (#1797)
- Update the README to reflect the latest AWS Knowledge MCP changes (#1846) (#1846)
- add AWS MCP to README (#1856) (#1856)
- update landing page (#1859) (#1859)
- add one-click install buttons for Kiro (#1733) (#1733)

## Chores

- bump packages for release/2025.11.20251113105935 (#1741) (#1741)
- Update CODEOWNERS for Application Signals MCP (#1737) (#1737)
- **release**: fix release issues (#1753) (#1753)
- **License**: skip samples (#1755) (#1755)
- bump packages for release/2025.11.20251114173808 (#1757) (#1757)
- **sample**: remove temp sample (#1758) (#1758)
- **licnese**: reenable sampels check (#1761) (#1761)
- **deps**: update github-actions: bump the github-actions-version-updates group across 1 directory with 4 updates (#1763) (#1763)
- **aws-api-mcp-server**: update fastmcp (#1677) (#1677)
- Update CODEOWNERS for Application Signals MCP (#1768) (#1768)
- bump packages for release/2025.11.20251119132423 (#1784) (#1784)
- **cloudwatch-applicationsignals-mcp-server**: prepare agentic enablement tool release (#1780) (#1780)
- **aws-api-mcp-server**: upgrade AWS CLI to v1.43.0 (#1789) (#1789)
- bump packages for release/2025.11.20251120134931 (#1791) (#1791)
- bump packages for release/2025.11.20251120162446 (#1792) (#1792)
- bump packages for release/2025.11.20251120192945 (#1798) (#1798)
- add codeowner to ac mcp (#1800) (#1800)
- bump packages for release/2025.11.20251121001139 (#1806) (#1806)
- **deps**: update npm: bump js-yaml in /docusaurus (#1773) (#1773)
- bump packages for release/2025.11.20251121220339 (#1818) (#1818)
- **doc**: add documentation for the 3 new agentcore tools (#1811) (#1811)
- bump packages for release/2025.11.20251122013630 (#1820) (#1820)
- bump packages for release/2025.11.20251124194829 (#1834) (#1834)
- bump packages for release/2025.11.20251124232317 (#1839) (#1839)
- bump packages for release/2025.11.20251126165607 (#1850) (#1850)
- bump packages for release/2025.11.20251128160211 (#1854) (#1854)
- **deps**: update npm: bump node-forge in /docusaurus (#1853) (#1853)
- bump packages for release/2025.12.20251202213310 (#1869) (#1869)

## Other Changes

- test: Add investigations sample app (#1709)

* Add investigations sample app

* Move folder (#1709)
- Small refactor (#1729) (#1729)
- Add vastin as code owner of Application Signals MCP. (#1731) (#1731)
- test(samples/cloudwatch-applicationsignals-mcp): setup terraform and cdk infra for python lambda (#1745)

* setup terraform and cdk infra for python lambda

* add codecov suppresion comments with valid justification

* remove internal lambda traffic loop

* remove health check (#1745)
- Handle Lambda function pagination (#1) (#1310)

Co-authored-by: Danilo Poccia <dpoccia@gmail.com>
Co-authored-by: Scott Schreckengaust <scottschreckengaust@users.noreply.github.com> (#1)
- align .NET Lambda with other languages (#1787) (#1787)
- support Application Signals enablement for ECS django (#1808)

Co-authored-by: Michael He <53622546+yiyuan-he@users.noreply.github.com> (#1808)
- fix readme anchor links (#1822)

Co-authored-by: Matthew Goodman <mtgoo@amazon.com> (#1822)
- Add kiro badge (#1872) (#1872)
