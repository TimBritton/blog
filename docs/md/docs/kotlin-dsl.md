# Kotlin custom DSL creation


I am a pretty big proponent of Kotlin as a language and for the last three years, I have had the opportunity to build a platform utilizing Kotlin in conjunction with Vertx.  I think one of the best parts of Kotlin is you can always discover a better way of doing something.  In this article, I am going to discuss how to write a Kotlin DSL and provide a simple example of a DSL I wrote recently for one of my toy projects.

Let start by discussing what a DSL is in the first place.  DSL stands for **D**omain **S**pecific **L**anguage which I would further define as modifying the syntax of Kotlin to adhere to a given concept in your broader system.

Kotlin enables you to build these DSLs via specific language features the three features I want to highlight are **Lambda Syntax**, **Higher-Order Functions** and **Extension Functions**.

## Lambda Syntax
The syntax for Lambda Functions is different than other languages and has some built-in functionality that is unique.

```kotlin
val listOfLetters = listOf("A", "B", "C").map{
it.toLowerCase()
}

//yields list ["a", "b", "c"]

```
Note:
* The Lambda is not a parameter to map but is after the map function name.  
* The input to the Lambda is automatically given a name `it`

## Higher Order Functions
Kotlin has higher-order functions which means you are able to pass functions into other functions

```kotlin

fun main(){
 val b =  {
    println("B")
}
    a(b)
//prints `B`
}
fun a(fn: () -> Unit){
    fn()
}
```

## Extension Functions

Extension Functions allow you to expand other classes with new functionality without updating the class itself.

```kotlin
class Cat() {
}

fun Cat.meow() {
println("MEOW")
}

fun main(){
val kitten = Cat()

kitten.meow()
//prints `MEOW`
}
```

## Putting it together

When you combine these three features you are able to customize Kotlin to fit the needs of what you are working on.

For one of my toy projects, I'm working on I wrote a DSL for creating tables for generating random value objects.

When utilizing this DSL you can write the following:
```kotlin

   val COMMON_ACTION_COST_TABLE =
        simpleTable<ActionCost>("Common Action Cost Table") {
            entry { 2.0 to ActionCost.ONE }
            entry { 30.0 to ActionCost.TWO }
            entry { 20.0 to ActionCost.THREE }
            entry { 20.0 to ActionCost.FOUR }
            entry { 18.0 to ActionCost.FIVE }
            entry { 10.0 to ActionCost.SIX }
            validate()
        }

```

What this code does is create a named table that associates a percentage to a give `ActionCost`.  You can then call `random()` to get a random value from the table where if you call it 100 times you will likely get `ActionCost.ONE` two percent of the time.

The class yielded by the simpleTable method is: 

```kotlin
class Table<T>(val tableName: String) {
    var tableEntries: MutableSet<Triple<Int, Int,  T>> = mutableSetOf()
    var rawEntries: MutableSet<Pair<Double,  T>> = mutableSetOf()

    internal fun addEntry(percentChance: Double, entry:T) {
        rawEntries.add(percentChance to entry)
        val lastEntryEnding = if (tableEntries.isEmpty()) {
            0
        } else {
            tableEntries.last().second
        }

        val inted = (percentChance * 100).toInt()
        if(lastEntryEnding+inted >= 10001){
            error("Table Malformed")
        }
        tableEntries.add(Triple(lastEntryEnding, lastEntryEnding + inted, entry))
    }

    fun random(): T {
        val rando = (0..10000).random()
        return tableEntries.filter{
            return@filter (rando > it.first && rando < it.second)
        }.first().third ?: error("Null when it shouldn't")
    }
}
```

_Note: I'm not working with doubles because rounding sucks.  Also wouldn't recommend using this on anything productive._

The DSL for constructing this data structure looks like so:


```kotlin
fun <T>simpleTable(tableName: String, x: Table<T>.() -> Unit): Table<T> {
    var table = Table<T>(tableName)
    x(table)
    return table;
}

fun <T> Table<T>.entry(e: () -> Pair<Double, T>){
    val entry = e()
    this.addEntry(entry.first, entry.second)
}

fun <T> Table<T>.validate(): Boolean {
    var percent = 0.0
    for(entry in rawEntries){
        percent += entry.first
    }

    return percent == 100.0
}
```

The DSL is composed of two extension methods providing the easy to use and understandable structure and the final extension validates the data within the structure since we want the percentage to add to 100.

When I wrote this DSL I wanted to be able to visually identify potential bugs with the percentages I assigned to a given entity and be able to quickly make a change to what could be a pretty large set of entries.

Well thats all I got for now.  Until next time

> :ToCPrevNext