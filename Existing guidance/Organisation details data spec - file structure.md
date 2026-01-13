# Organisation details file specification for extended producer responsibility

This guidance explains how to submit your organisation details for extended producer responsibility (EPR) for packaging. 

This is part of registration and a legal obligation for organisations that are affected by EPR for packaging. 

[Find out more about registration and registration fees](/government/admin/detailed-guides/1634475), including how to report these organisation details.


## What ‘organisation details’ are

Organisation details include:

* address
* packaging activities
* the people who'll be verifying and submitting your data

You may also need to report your organisation’s:

* brand activities - if you supply goods to the UK market in primary, secondary, or shipment packaging under their own brand
* partners - if you’re registered as a partnership in Companies House

You'll need to record each of these in a separate file and submit them at the same time as your organisation details.

Full details of what you need to report are in this guidance.

## What you need to report

In the organisation details file, you need to report the organisation’s:

* general information – for example name, organisation type and packaging activities 
* addresses
* people 

### General information 

There are some categories that you only need to enter if the organisation is a:

* limited liability partnership 
* limited liability company 
* public limited company
* limited partnership

These are marked in the 'Description' column with ‘Limited orgs only’.

^Where allowed values are listed follow them exactly, including capitalisation - for example, if importing is a secondary activity for your organisation, you must enter 'Secondary', not 'secondary'.

^ You can report as a group, but you must provide general information for each organisation and subsidiary in the group.

**Table 1: File structure for general information**

| Order (column letter) |Column header| Description | Allowed values | Required for 1 October 2023 and 1 April 2024? |
|-|-|-|-|
| 1 (A) | organisation_id | The identification number assigned to an organisation when they create an account.  This is 6 figures long. Do not include any spaces.<br><br> This will be the same for all organisations and subsidiaries when reporting as a group. | Any | Yes |
| 2 (B) | subsidiary_id | An identification number assigned to a subsidiary by its parent company. <br><br>This field must be used by parent companies when reporting on behalf of subsidiaries. Otherwise, leave blank. <br><br> Use the same unique ID for a subsidiary across all packaging and organisation data submissions. | Any | Yes |
| 3 (C) | organisation_name |  Organisation name <br><br>Where applicable, this must exactly match your Companies House listing - for example if your listing says 'limited' do not use 'Ltd'. <br><br>If reporting as a group you will need to provide names for the main organisation and any subsidiaries. For subsidiaries, this will be different from the parent company. | Any | Yes |
| 4 (D) | trading_name | Trading name. <br><br>The trading name for your organisation, or for each organisation and subsidiary, when reporting as a group. Only include if different from organisation name. | Any | Yes |
| 5 (E) | companies_house_<br>number | Companies House registration number for your organisation, or for each organisation or subsidiary when reporting as a group.<br><br>Give the full 8 digits. If there are leading zeroes, include them and add &#39; at the start, for example &#39;00123456. <br><br>Limited orgs only. | Any | No |
| 6 (F) | home_nation_code | Home nation code : the UK nation where an organisation is registered.  <br><br> England, Northern Ireland, Scotland, Wales. | EN, NI, SC, WS | Yes |
| 7 (G) | main_activity_sic  | Main activity SIC (not needed if Organisation type is ‘Outside UK’ or ‘Others’): the [SIC code](https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic) for your main packaging activity by tonnage. | Any |  No |
| 8 (H) | organisation_type_code | Organisation type code, as listed in Companies House.  <br><br> Sole trader (SOL), Partnership (PAR), Regulator (REG), Public limited company (PLC), Limited Liability partnership (LLP), Limited Liability company (LTD), Limited partnership (LPA), Co-operative (COP), Community interest Company (CIC), Outside UK (OUT), Others (OTH) | SOL, PAR, REG, PLC, LLP, LTD, LPA, COP, CIC, OUT, OTH | Yes |
| 9 (I) | organisation_sub_<br>type_code | Organisation sub-type: Licensor (LIC), Pub operating business (POB), Franchisor (FRA), Non-associated organisation (NAO), Holding company (HCY), Subsidiary (SUB), Licensee/Franchisee (LFR), Tenant (TEN), Others (OTH) | LIC, POB, FRA, NAO, HCY, SUB, LFR, TEN, OTH | No |
| 10 (J) | packaging_activity_so| Supplied under your brand: does the organisation supply goods to the UK market in primary, secondary or shipment packaging under its own brand?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 11 (K) | packaging_activity_pf | Packed or filled as unbranded: does the organisation place goods into packaging that’s unbranded when it’s sold?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 12 (L) | packaging_activity_im | Imported: does the organisation import packaging that contains goods into the UK to sell?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 13 (M) | packaging_activity_se | Supplied as empty: does the organisation sell empty packaging to businesses that have an annual turnover of less than £2 million and supply less than 50 tonnes of packaging a year?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 14 (N) | packaging_activity_hl | Hired or loaned: does the organisation hire or loan out reusable packaging to UK organisations?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 15 (O) | packaging_activity_om | Supplied through an online marketplace that you own: does the organisation own an online marketplace that allows non-UK organisations to sell packaged products in the UK?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 16 (P) | packaging_activity_sl | Selling: does the organisation sell empty or filled packaging directly to end consumers?<br><br>Choose whether this is a primary or secondary activity for the organisation. | Primary, Secondary, No | Yes |
| 17 (Q) | registration_type_code | Registration type code: whether you are registering as a group (GR) or an individual (IN). | GR, IN | Yes | 
| 18 (R) | turnover | The organisation’s most recent annual turnover, based on the last audited accounts made available before 7 April in the obligation year.<br><br> Give this in millions to 2 decimal places - for example, if your turnover is £24,500,000, enter 24.50 | Use digits only, in whole numbers. Do not include ‘£’ | Yes |
| 19 (S) | total_tonnage | Total weight of all packaging activities in the calculation year combined, in tonnes. For example, for 2023 data this is packaging handled in 2022.<br><br>Organisations must assess the packaging they handled in the calculation year to determine if they meet the small or large packaging thresholds. | Use digits only, in whole numbers. | Yes |
| 20 (T) | produce_blank_<br>packaging_flag | Does the organisation put packaging on the market which has no brand names, identifying marks or trademarks? | Yes, No | Yes |
| 21 (U) | liable_for_disposal_<br>costs_flag | Does the organisation place household packaging on the market?  |Yes, No | No |
| 22 (V) | meet_reporting_<br>requirements_flag | Reporting requirements: confirm that you are able to oversee the process for this  organisation to report its packaging activities. <br><br>This includes keeping account information up to date, making sure all data gets submitted and communicating about fees. | Yes, No | No |





### Addresses

In the same CSV file as the other organisation details, you need to include addresses for the organisation. :

* registered address on Companies House, if it’s a limited liability partnership (LLP), limited liability company (LTD) or limited partnership (LP)
* head office or principal place of business, unless it’s a limited liability partnership (LLP), limited liability company (LTD) or limited partnership (LP)
* audit address – this is a place the regulator can start an audit of submitted information

The first two addresses must be submitted by the deadline. 

You must also include a service of notice address if this is different from the registered address. This is where we will send legal notices if the organisation is non-compliant. 

Do not include a service of notice address if it is the same as the registered address. 

^ If you're reporting as a group, you should include the addresses for each organisation and subsidiary within the group.

For all addresses you need to include the:

* first line of the address 
* postcode

For all addresses apart from the audit address, you also need to include a phone number.

For any of the addresses you can include the:

* city
* county
* country

Each piece of information must go in a separate column in the file - check the table below and [look at the template to see how they must be arranged](/government/admin/publications/1464798).

**Table 2: File structure for addresses**

| Order (spreadsheet column) | Column header | Description | 
|-|-|-|
| 23 (W) | registered_addr_line1 | Registered address line 1 | 
| 24 (X) | registered_addr_line2 | Registered address line 2 | 
| 25 (Y) | registered_city | registered address city | 
| 26 (Z) | registered_addr_county | Registered address county | 
| 27 (AA)| registered_addr_postcode | Registered address postcode | 
| 28 (AB) | registered_addr_country | Registered address country | 
| 29 (AC) | registered_addr_phone_number | Registered address phone number | 
| 30 (AD)  | audit_addr_line1 | Audit address line 1 | 
| 31 (AE) | audit_addr_line2 | Audit address line 2 | 
| 32 (AF) | audit_addr_city | Audit address city | 
| 33 (AG) | audit_addr_county | Audit address county | 
| 34 (AH) | audit_addr_postcode | Audit address postcode | 
| 35 (AI) | audit_addr_country | Audit address country | 
| 36 (AJ) | service_of_notice_addr_line1 | Service of notice address line 1 | 
| 37 (AK) | service_of_notice_addr_line2 | Service of notice address line 2 | 
| 38 (AL) | service_of_notice_addr_city | Service of notice address city | 
| 39 (AM) | service_of_notice_addr_county | Service of notice address county | 
| 40 (AN) | service_of_notice_addr_postcode |Service of notice address postcode | 
| 41 (AO) | service_of_notice_addr_country | Service of notice address country | 
| 42 (AP) | service_of_notice_addr_phone_number | Service of notice address phone number | 
| 43 (AQ) | principal_addr_line1 | Principal place of business address line 1 | 
| 44 (AR) | principal_addr_line2 | Principal place of business address line 2 | 
| 45 (AS) | principal_addr_city | Principal place of business address city | 
| 46 (AT) | principal_addr_county | Principal place of business address county | 
| 47 (AU) | principal_addr_postcode | Principal place of business address postcode | 
| 48 (AV) | principal_addr_country | Principal place of business address country | 
| 49 (AW) | principal_addr_phone_number | Principal place of business address phone number | 


### Sole traders

If your organisation is a sole trader, you also need to enter the sole trader’s:

* first name
* last name
* phone number
* email address

Each piece of information must go in a separate column in the file - check the table below and [look at the template to see how they must be arranged](/government/admin/publications/1464798).

Include these empty columns even if they do not apply to you.


**Table 3: File structure for sole traders**

| Order (spreadsheet column) | Column header | Description | 
|-|-|-|
| 50 (AX) | sole_trader_first_name | Sole trader first name |
| 51 (AY) | sole_trader_last_name | Sole trader last name |
| 52 (AZ) | sole_trader_phone_number | Sole trader phone number |
| 53 (BA) | sole_trader_email | Sole trader email |

^If you are not a sole trader include the columns but leave them blank. 

### People

You need to include your organisation’s primary contact. This is the first person we should contact if we have questions about the process.

You must supply this information for 1 October and 1 April each year.

If you're a group with subsidiaries, you only need to supply the primary contact for the head organisation. 

You should also include your approved person - the person in charge of submitting information to the environmental regulator. The approved person will usually be the person who created a 'Report packaging data' account for your organisation. 

^If you're a compliance scheme, this must be the approved person at the organisation you're reporting on behalf of – you'll also need to tell us whether the approved person or delegated person verified the data on behalf the producer

If you have one, you can also include your organisation’s:

* delegated person - this is another person who can submit information to the environmental regulator
* secondary contact - the next person we should contact if we have questions about the process

For each person include:

* first name
* last name
* phone number
* email address

You can also include their job title.

Each piece of information must go in a separate column in the file - check the table below and [look at the template to see how they must be arranged](/government/admin/publications/1464798).

**Table 4: File structure for people**

| Order (spreadsheet column) | Column header | Description | 
|-|-|-|
| 54 (BB) | approved_person_first_name |  Approved person first name |
| 55 (BC) | approved_person_last_name | Approved person last name |
| 56 (BD) | approved_person_phone_number | Approved person phone number |
| 57 (BE) | approved_person_email | Approved person email |
| 58 (BF) | approved_person_job_title | Approved person job title |
| 59 (BG) | delegated_person_first_name | Delegated person first name |
| 60 (BH) | delegated_person_last_name | Delegated person last name |
| 61 (BI) | delegated_person_phone_number | Delegated person phone number |
| 62 (BJ) | delegated_person_email | Delegated person email |
| 63 (BK) | delegated_person_job_title | Delegated person job title |
| 64 (BL) | primary_contact_person_first_name | Primary contact first name |
| 65 (BM) | primary_contact_person_last_name | Primary contact last name |
| 66 (BN) | primary_contact_person_phone_number | Primary contact phone number |
| 67 (BO) | primary_contact_person_email | Primary contact email |
| 68 (BP) | primary_contact_person_job_title | Primary contact job title |
| 69 (BQ) | secondary_contact_person_first_name | Secondary contact first name |
| 70 (BR) | secondary_contact_person_last_name | Secondary contact last name |
| 71 (BS) | secondary_contact_person_phone_number | Secondary contact phone number |
| 72 (BT) | secondary_contact_person_email | Secondary contact email |
| 73 (BU) | secondary_contact_person_job_title | Secondary contact job title |

### Organisation size 

There is an additional column for 2025 registration. You must indicate whether you are a small or large organisation (this is also known as being a 'small or large producer'). [Find out about what counts as a small and large organisation](https://www.gov.uk/guidance/extended-producer-responsibility-for-packaging-who-is-affected-and-what-to-do#what-you-may-need-to-do) under EPR for packaging.

| Order (column letter) |Column header| Description | Allowed values |
| 73 (BV) | organisation_size | Small or large organisation  | S, L |


## Updates to organisation details during the reporting year

If there have been changes to your organisation during the year, you need to report them by uploading an updated organisation details file. 

This includes changes such as adding or removing subsidiaries or changes to how an organisation’s packaging data will be reported.

Compliance schemes should also report members leaving and joining using an updated file. 

^ Do not remove rows containing subsidiaries that are leaving - just fill in the leaver information for them, including the mandatory 'leaver code'.

If your organisation becomes insolvent and is no longer trading contact the environmental regulators immediately.

There is more detail about groups, subsidiaries and how mid-year changes affect their reporting and obligations in the ‘agreed positions and technical interpretations’ guidance, produced by the environmental regulators. It is currently stored on the [National Packaging Waste Database](https://npwd.environment-agency.gov.uk/Public/Guidance.aspx?CategoryId=41fc1dbb-47a2-47fd-bb82-4938d83729e0&ReturnUrl=%2FPublic%2FNewsAndGuidance.aspx%3FReturnUrlId%3D64c793b7-1cf6-ed11-9f3b-98f2b327e115).

Use these columns to report these changes. 

**Table 5: File structure for reporting changes**

| Order (spreadsheet column) | Column header | Description |
|-|-|-|
| 75 (BW) | leaver_code | Leaver code - this is mandatory for leavers |
| 76 (BX) | leaver_date | Leaver date |
| 77 (BY) | organisation_change_reason | Organisation change reason |
| 78 (BZ) | joiner_date | Joiner date |

### Codes and formats for reporting changes

#### leaver_code 

You must give a joiner or leaver code for each subsidiary you add to or remove from your group registration.

| Code | Description |
| --- | --- | 
| 1 | Producer who previously met thresholds has joined a group. | 
| 2 | Producer who did not previously meet thresholds has joined a group. Percentage  obligation based on number of days in the year they were part of the group. | 
| 3 | Producer who did not previously meet thresholds has joined a group. Percentage  obligation based on number of days in the year they were part of the group. | 
| 4 | Producer who does not independently meet the thresholds has left group. Holding company responsible for obligations due to mid-year change. | 
| 5 | Producer who does not independently meet the thresholds has left group. Holding company responsible for obligations due to mid-year change. | 
| 6 | Producer who meets thresholds independently has left group. Holding company remains responsible for obligation due to mid-year change. | 
| 7 | Producer has joined group but holding company is not responsible for obligation due to mid-year change. | 
| 8 | Producer has left group. Holding company remains responsible for obligation due to mid-year change. | 
| 9 | Producer has joined group but is not responsible for obligation due to mid-year change. | 
| 10 | Producer has left group. Holding company remains responsible for obligation due to mid-year change. | 
| 11 | Producer is no longer obligated - insolvency event and no longer trading | 
| 12 | Producer no longer obligated – ceased performing a producer function. | 
| 13 | Producer has resigned from compliance scheme. | 
| 14 | Compliance scheme has terminated producer's membership. | 
| 15 | Company has become a producer as result of a mid-year change. | 
| 16 | Merged with another company – not incapacity related. | 
| 17 | Producer becomes a producer as a result of carrying on the activities of an incapacitated producer. | 

If you are unsure which leaver or joiner code to use, [contact your regulator](#contact-your-regulator). 

#### leaver_date 

Enter the date that the subsidiary left the group, in the format DD/MM/YYYY. 

#### organisation_change_reason 

Enter the reason that the subsidiary left the group, up to a maximum of 250 characters.

#### joiner_date 

Enter the date that the subsidiary joined the group, in the format DD/MM/YYYY.


## Brand information

If you enter a packaging activity as ‘supplied under your brand’ in the organisation details file, you need to submit a separate CSV file with information about the brand. 

[Use the template](/government/admin/publications/1464798) or create a CSV file with the same headers. 


**Table 5: File structure for the brand information CSV file**

| Name | Column header | Description | Value |
|-|-|-|-|
| Organisation ID  | organisation_id | The brand owner’s organisation ID. This is 6 figures long. Do not include any spaces. | Any |
| Subsidiary ID | subsidiary_id | An identification number assigned to a subsidiary by its parent company. | Any |
| Brand name | brand_name | The word or phrase used to identify the brand.  | Any |
| Brand type code | brand_type_code | Whether the brand identifier is a brand name (BN), trademark (TM) or other (OT). | BN, TM, OT |


## Partner information

If you enter an organisation type of ‘partnership’ in the organisation details file, you will need to submit a separate CSV file about your organisation’s partners.

[Use the template](/government/admin/publications/1464798) or create a CSV file with the same headers. 

**Table 6: File structure for the partner information CSV file**

| Name | Column header | Description | Value |
|-|-|-|-|
| Organisation ID | organisation_id | The ID of the organisation that the partner belongs to.  This is 6 figures long. Do not include any spaces.| Any |
| Subsidiary ID | subsidiary_id | An identification number assigned to a subsidiary by its parent company. | Any |
| First name | partner_first_name|  | Any |
| Last name | partner_last_name | | Any |
| Phone number | partner_phone_number |  | Any |
| Email | partner_email | | Any |


## Compliance schemes

If you’re a compliance scheme, use the same files for all organisations. Do not create separate files for each organisation.

## Contact your regulator

### Environment Agency 

Email: <packaging@environment-agency.gov.uk> 

### Natural Resources Wales 

Email: <packaging@naturalresourceswales.gov.uk> 

### Scottish Environment Protection Agency 

Email: <producer.responsibility@sepa.org.uk> 

### Northern Ireland Environment Agency 

Email: <packaging@daera-ni.gov.uk>


*[EPR]: extended producer responsibility
*[CSV]: comma separated values