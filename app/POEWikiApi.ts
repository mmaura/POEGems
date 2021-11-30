/**
 * Class providing the API URL for calling chunk of data
 * Using cargo query API it allows us to join tables that interest us, although it does not allow us to name the field returned.
 * Therefore we need to call the API once with Vendor Rewards and once with Quest Rewards as they share the same names for fields.
 * 
 * Table that are interesting for us are:
 *  - items - we collect all the active and support skill gems from
 *  - skill_gems - we collect the primary stat from that
 *  - vendor_rewards - we collect information in which act and from which NPC when we can buy a gem
 *  - quest_rewards - we collect information for which quest we can get the gem as a reward
 * 
 * Furthermore the API allows us only to call for 500 elements, so we need to set the limit and offset in the query string properly
 */
class POEWikiApi {
    // static GEMS_ACTIVE_VENDOR_API_TEMP = 'https://www.poewiki.net/w/api.php?action=cargoquery&tables=items,skill_gems,vendor_rewards&join_on=items.name=skill_gems._pageName,items.name=vendor_rewards._pageName&fields=items.name,items.required_level,skill_gems.primary_attribute,vendor_rewards.npc,vendor_rewards.quest,vendor_rewards.act,vendor_rewards.classes&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    // static GEMS_SUPPORT_VENDOR_API_TEMP = 'https://www.poewiki.net/w/api.php?action=cargoquery&tables=items,skill_gems,vendor_rewards&join_on=items.name=skill_gems._pageName,items.name=vendor_rewards._pageName&fields=items.name,items.required_level,skill_gems.primary_attribute,vendor_rewards.npc,vendor_rewards.quest,vendor_rewards.act,vendor_rewards.classes&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'

    // static GEMS_ACTIVE_QUEST_API_TEMP = 'https://www.poewiki.net/w/api.php?action=cargoquery&tables=items,skill_gems,quest_rewards&join_on=items.name=skill_gems._pageName,items.name=quest_rewards._pageName&fields=items.name,items.required_level,skill_gems.primary_attribute,quest_rewards.quest,quest_rewards.act,quest_rewards.classes&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    // static GEMS_SUPPORT_QUEST_API_TEMP = 'https://www.poewiki.net/w/api.php?action=cargoquery&tables=items,skill_gems,quest_rewards&join_on=items.name=skill_gems._pageName,items.name=quest_rewards._pageName&fields=items.name,items.required_level,skill_gems.primary_attribute,quest_rewards.quest,quest_rewards.act,quest_rewards.classes&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'



    // static GEMS_ACTIVE_VENDOR_API_TEMP = 'https://pathofexile.gamepedia.com/api.php?action=cargoquery&tables=items,skill_gems,vendor_rewards&join_on=items.name=skill_gems._pageName,items.name=vendor_rewards._pageName&fields=items.name, items.html, item_sell_prices.amount=price_amount, item_sell_prices.name=price,items.required_level,vendor_rewards.npc,vendor_rewards.quest,vendor_rewards.act,vendor_rewards.classes&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    // static GEMS_SUPPORT_VENDOR_API_TEMP = 'https://pathofexile.gamepedia.com/api.php?action=cargoquery&tables=items,skill_gems,vendor_rewards&join_on=items.name=skill_gems._pageName,items.name=vendor_rewards._pageName&fields=items.name,items.html, item_sell_prices.amount=price_amount, item_sell_prices.name=price, items.required_level,vendor_rewards.npc,vendor_rewards.quest,vendor_rewards.act,vendor_rewards.classes&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'

    // static GEMS_ACTIVE_BASE_TEMP= 'https://pathofexile.fandom.com/api.php?action=cargoquery&tables=items,item_sell_prices&join_on=items.name=item_sell_prices._pageName&fields=items.name,items.required_level,items.html,item_sell_prices.amount=price_amount,item_sell_prices.name=price&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    static GEMS_ACTIVE_BASE_TEMP= 'https://pathofexile.fandom.com/api.php?action=cargoquery&tables=items,item_purchase_costs&join_on=items.name=item_purchase_costs._pageName&fields=items.name,items.required_level,items.html,item_purchase_costs.amount=price_amount,item_purchase_costs.name=currency&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    // static GEMS_SUPPORT_BASE_TEMP= 'https://pathofexile.fandom.com/api.php?action=cargoquery&tables=items,item_sell_prices&join_on=items.name=item_sell_prices._pageName&fields=items.name,items.required_level,items.html,item_sell_prices.amount=price_amount,item_sell_prices.name=price&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    static GEMS_SUPPORT_BASE_TEMP= 'https://pathofexile.fandom.com/api.php?action=cargoquery&tables=items,item_purchase_costs&join_on=items.name=item_purchase_costs._pageName&fields=items.name,items.required_level,items.html,item_purchase_costs.amount=price_amount,item_purchase_costs.name=currency&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'

    static GEMS_ACTIVE_VENDOR_API_TEMP = 'https://pathofexile.gamepedia.com/api.php?action=cargoquery&tables=items,skill_gems,vendor_rewards,item_sell_prices&join_on=items.name=item_sell_prices._pageName,items.name=skill_gems._pageName,items.name=vendor_rewards._pageName&fields=items.name,vendor_rewards.npc,vendor_rewards.quest,vendor_rewards.act,vendor_rewards.classes,items.name,&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    static GEMS_SUPPORT_VENDOR_API_TEMP = 'https://pathofexile.gamepedia.com/api.php?action=cargoquery&tables=items,skill_gems,vendor_rewards,item_sell_prices&join_on=items.name=item_sell_prices._pageName,items.name=skill_gems._pageName,items.name=vendor_rewards._pageName&fields=items.name,vendor_rewards.npc,vendor_rewards.quest,vendor_rewards.act,vendor_rewards.classes&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'

    static GEMS_ACTIVE_QUEST_API_TEMP = 'https://pathofexile.gamepedia.com/api.php?action=cargoquery&tables=items,skill_gems,quest_rewards&join_on=items.name=skill_gems._pageName,items.name=quest_rewards._pageName&fields=items.name,skill_gems.primary_attribute,quest_rewards.quest,quest_rewards.act,quest_rewards.classes&where=class_id=%22Active%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'
    static GEMS_SUPPORT_QUEST_API_TEMP = 'https://pathofexile.gamepedia.com/api.php?action=cargoquery&tables=items,skill_gems,quest_rewards&join_on=items.name=skill_gems._pageName,items.name=quest_rewards._pageName&fields=items.name,skill_gems.primary_attribute,quest_rewards.quest,quest_rewards.act,quest_rewards.classes&where=class_id=%22Support%20Skill%20Gem%22&limit=%%LIMIT%%&offset=%%OFFSET%%&format=json'

    static LIMIT_MACRO = '%%LIMIT%%'
    static OFFSET_MACRO = '%%OFFSET%%'

    static getChunkAPI(api: String, limit: Number, offset: Number): string {
        var url = api
                .replace(POEWikiApi.LIMIT_MACRO, limit.toString())
                .replace(POEWikiApi.OFFSET_MACRO, offset.toString())
        console.log(url)
        return url
    }
}

export default POEWikiApi
