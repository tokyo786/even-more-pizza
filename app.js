
function get_output(filename) {
    let start_time = Date.now()

    const fs = require("fs")
    const file = fs.readFileSync(`./${filename}.in`, 'utf8')
    const lines = file.split('\n')
    
    const first_line = lines[0].split(' ')
    
    let total_pizzas = Number(first_line[0])
    let two_person_teams = Number(first_line[1])
    let three_person_teams = Number(first_line[2])
    let four_person_teams = Number(first_line[3])
    
    let pizza_ingredients_list = lines.slice(1).map(l => l.split(' ').slice(1)).filter(a => a.length > 0)
    let pizza_indexes_list = pizza_ingredients_list.map((_, i) => i)
    
    // Do better sorting to optimize more in future
    // Try without sorting and try different methods to see different scores
    
    // sort the pizza list to from most to least ingredients
    let sorted_pizza_index_list = pizza_indexes_list.sort((a, b) => pizza_ingredients_list[b].length - pizza_ingredients_list[a].length)

    let undelivered_pizza_set = new Set(sorted_pizza_index_list)
    function log_undelivered() {
        console.log(`Undelivered: ${undelivered_pizza_set.size}`)
    }
    log_undelivered()
    
    let max_teams = Math.max(two_person_teams, three_person_teams, four_person_teams)
    
    // console.log({
    // 	total_pizzas,
    // 	two_person_teams,
    // 	three_person_teams,
    // 	four_person_teams,
    // 	pizza_ingredients_list
    // })
    
    // delivered pizza indexes
    let delivered_indexes = []

    // List of delivered indexes for different team sizes (deliveries)
    let deliveries = []
    
    // this function delivers pizzas given a team size,
    // number of teams for that size,
    // and current index for the team size 
    function deliver(team_size, number_of_teams, i) {
        // console.log(`deliver(${team_size}, ${number_of_teams}, ${i})`)
        if (i >= number_of_teams) return;
    
        let pizzas_on_plate = []

        // for every person in the team
        for (let t = 0; t < team_size; t++) {
    
            // index of pizza to add to plate
            let index_to_add;

            let total_old_ingredients = pizzas_on_plate.map(i => pizza_ingredients_list[i]).flat()
            let total_old_combined_ingredients_length = new Set(total_old_ingredients).size

            // for every undelivered pizza, do the below
            // finds the pizza index to add to plate
            // OPTIMIZE THE BELOW MORE!
            for (let p of undelivered_pizza_set) {
    
                if (pizzas_on_plate.includes(p)) continue;

                // if there's no pizza on plate
                if (pizzas_on_plate.length == 0) {
                    // add the current index and break the loop
                    // (We can do this as the list is sorted from most to least ingredients)
                    index_to_add = p

                    // try to change the `break` to `continue` to see different scores
                    break;
                }
    
                let total_combined_ingredients_set = new Set(total_old_ingredients)
                let new_ingredients = pizza_ingredients_list[p]
                for (let ingredient of new_ingredients) {
                    total_combined_ingredients_set.add(ingredient)
                }
                
                if (total_combined_ingredients_set.size > total_old_combined_ingredients_length) {
                    index_to_add = p;
                } else if (total_combined_ingredients_set.size == total_old_combined_ingredients_length) {
                    if (typeof index_to_add != 'number') {
                        index_to_add = p;
                    } else if (pizza_ingredients_list[p].length < pizza_ingredients_list[index_to_add].length) {
                        index_to_add = p;
                    }
                }
            }
            // if we found an index to add to plate
            if (typeof index_to_add == 'number') {
                // push it ;)
                pizzas_on_plate.push(index_to_add)
            }
        }
    
        // if the plate has enough pizzas for this team
        if (pizzas_on_plate.length == team_size) {
            // deliver the pizzas
            deliveries.push(pizzas_on_plate)
            for (let index of pizzas_on_plate) {
                delivered_indexes.push(index)

                // remove the pizza from undelivered set
                undelivered_pizza_set.delete(index)
                // console.log(`Delivered #${index}`, `Undelivered: ${undelivered_pizza_list.size}`)
            }
        }
    }
    
    // for every team index
    for (let i = 0; i < max_teams; i++) {
        // deliver pizzas to different teams
        // try with different orders
        deliver(2, two_person_teams, i)
        deliver(3, three_person_teams, i)
        deliver(4, four_person_teams, i)

        // log number of undelivered pizzas
        log_undelivered()
    }
    let end_time = Date.now()
    console.log(end_time - start_time,'ms')
    
    const deliveries_with_ingredients = deliveries.map(d => d.map((i => pizza_ingredients_list[i])))
    
    function count_score(deliveries_with_ingredients) {
        return deliveries_with_ingredients.map(d => {
            return [...new Set(d.flat())].length**2
        }).reduce((a, b) => a + b, 0)
    }
    
    // Log some stats
    console.log({
        total_pizzas, 
        delivered_pizzas: delivered_indexes.length, 
        deliveries: deliveries.length, 
        score: count_score(deliveries_with_ingredients)
    })
    

    // Generate output string and write to output file
    let output_string = ''
    output_string += deliveries.length + '\n'
    for (let delivery of deliveries) {
        output_string += delivery.length + ' ' + delivery.join(' ') + '\n'
    }
    fs.writeFileSync(`./${filename}.out`, output_string)
    return output_string
}

// // uncomment the below lines, one by one, to generate output files ending in .out extension.
// // Please note that the solution is unoptimized, it can take A LOT OF TIME to run.

// get_output('a_example')
// get_output('b_little_bit_of_everything')
get_output('c_many_ingredients')
get_output('d_many_pizzas')
get_output('e_many_teams')