import axios from 'axios'
import POEWikiApi from './POEWikiApi'
import * as fs from 'fs'
import * as path from 'path'

interface IGems {
  name: string,
  required_level: number
  html?: string,
  currency: string,
  currency_amount: number,
  vendor_rewards: VendorReward[],
  quest_rewards: QuestReward[],
  alternative_quality: string[],
  is_socket: boolean
}
enum AltQual {
  Divergent = "Divergent",
  Anomalous = "Anomalous",
  Phantasmal = "Phantasmal"
}

interface VendorReward {
  npc: string,
  quest: string,
  actId: number,
  classes: string[]
}
interface QuestReward {
  npc: string,
  quest: string,
  actId: number,
  classes: string[]
}

class App {
  gems: IGems[] = []

  async run() {
    console.log('Running')

    await this.processSockets()


    Promise.all([
      this.processGemsBaseChunk(POEWikiApi.GEMS_ACTIVE_BASE_TEMP, 400, 0),
      this.processGemsBaseChunk(POEWikiApi.GEMS_ACTIVE_BASE_TEMP, 500, 400),
      this.processGemsBaseChunk(POEWikiApi.GEMS_SUPPORT_BASE_TEMP, 400, 400),
      this.processGemsBaseChunk(POEWikiApi.GEMS_SUPPORT_BASE_TEMP, 500, 0),
    ])
      .then(() => {
        Promise.all([
          this.processGemsVendorChunk(POEWikiApi.GEMS_ACTIVE_VENDOR_API_TEMP, 400, 0),
          this.processGemsVendorChunk(POEWikiApi.GEMS_ACTIVE_VENDOR_API_TEMP, 500, 400),
          this.processGemsVendorChunk(POEWikiApi.GEMS_SUPPORT_VENDOR_API_TEMP, 500, 0),
          this.processGemsVendorChunk(POEWikiApi.GEMS_SUPPORT_VENDOR_API_TEMP, 500, 500),

          this.processGemsQuestChunk(POEWikiApi.GEMS_ACTIVE_QUEST_API_TEMP, 500, 0),
          this.processGemsQuestChunk(POEWikiApi.GEMS_SUPPORT_QUEST_API_TEMP, 500, 0),
        ])
          .then(() => {
            this.assertNoDuplicates()
              .then((result) => {
                if (result) {
                  fs.writeFileSync(path.join(__dirname, '../dist', 'gems.json'), JSON.stringify(this.gems, null, 2))
                  console.log('\n\n' + this.gems.length + ' gems processed and written to file')
                }
              })
          })

      })
  }

  async processGemsBaseChunk(api: String, limit: Number, offset: Number): Promise<void> {
    console.log('Calling API for gems BASE chunk of data')
    let response = await axios.get(POEWikiApi.getChunkAPI(api, limit, offset))
    let data = response.data.cargoquery

    // Itterate through all the returned gems
    data.forEach((gemData, index) => {
      // Check if the gem was alredy added to the `gems` object
      let gem = gemData.title as IGems

      if (this.gems.find(g => g.name === gem.name))
        console.log(`** BaseGems ** double gem ${gem.name} , index ${index}`)
      else {
        var altQ = [] as string[]

        if (gem.html.search(/Divergent/) !== -1) altQ.push("Divergent")
        if (gem.html.search(/Anomalous/) !== -1) altQ.push("Anomalous")
        if (gem.html.search(/Phantasmal/) !== -1) altQ.push("Phantasmal")
        // If it's a new gem, create an entry in `gems` object for it
        this.gems.push({
          name: gem.name,
          alternative_quality: altQ,
          required_level: Number(gem['required level']),
          // html: gem['html'],
          currency_amount: Number(gem['price_amount']),
          currency: gem['currency'],
          vendor_rewards: [],
          quest_rewards: [],
          is_socket: false
        })
      }
    })
  }


  async processSockets(): Promise<void> {
    for (const name of ["Green Socket", "Red Socket", "Blue Socket", "White Socket"]) {
      this.gems.push({
        name: name,
        alternative_quality: [],
        required_level: 0,
        currency: "",
        currency_amount: 0,
        is_socket: true,
        vendor_rewards: [],
        quest_rewards: [],
    })
    }
  }

  async processGemsVendorChunk(api: String, limit: Number, offset: Number): Promise<void> {
    console.log('Calling API for gems with VENDOR rewards chunk of data')
    let response = await axios.get(POEWikiApi.getChunkAPI(api, limit, offset))
    let data = response.data.cargoquery

    console.log(`Enriching the gems objects with ${data.length} Vendor`)
    data.forEach(gemData => {
      let gem = gemData.title
      let existingGem = this.gems.find(g => g.name === gem.name)

      if (!existingGem) {
        throw new Error(`** VendorGems ** impossible new gem ${gem.name}`)
      }

      if (gem.npc && gem.npc !== "")
        existingGem.vendor_rewards.push({
          npc: gem.npc,
          quest: gem.quest,
          actId: Number(gem.act),
          classes: ((gem.classes) && gem.classes.length > 0) ? gem.classes.split(',') : []
        })
    })
  }

  async processGemsQuestChunk(api: String, limit: Number, offset: Number): Promise<void> {
    console.log('Calling API for gems with QUEST rewards chunk of data')
    let response = await axios.get(POEWikiApi.getChunkAPI(api, limit, offset))
    let data = response.data.cargoquery

    console.log(`Enriching the gems objects with ${data.length} Quest`)
    data.forEach(gemData => {
      let gem = gemData.title
      let existingGem = this.gems.find(g => g.name === gem.name)

      if (!existingGem) {
        throw new Error(`** QuestGems ** impossible new gem ${gem.name}`)
      }
      if (gem.quest && gem.quest !== "")
        existingGem.quest_rewards.push({
          quest: gem.quest,
          actId: Number(gem.act),
          npc: gem.npc,
          classes: ((gem.classes) && gem.classes.length > 0) ? gem.classes.split(',') : []
        })
    })
  }

  /**
   * Checks if there is no duplicates in the gems processed from the API.
   * Because we are loading the data in chunks there may be a situation when one gem occure in both chunks.
   */
  async assertNoDuplicates(): Promise<Boolean> {
    if (this.gems.length === 0) {
      console.log('Gems are not loaded in, there is nothing to check, did you forget to call `run()` method?')
      return
    }

    let result = true
    let map = {};

    for (var i = 0; i < this.gems.length; i++) {
      var index = JSON.stringify(this.gems[i].name);
      if (!map[index]) {
        map[index] = 1;
      } else {
        map[index]++;
      }
    }

    for (var key in map) {
      if (map[key] > 1) {
        result = false
        console.log(JSON.parse(key) + 'is duplicated, found: ' + map[key] + ' entries');
      }
    }

    return result
  }
}

export default App