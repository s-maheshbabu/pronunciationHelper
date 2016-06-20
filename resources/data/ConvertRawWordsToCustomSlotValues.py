wordsAlreadySeen = set()
totalNumberOfWords = 0

with open('SpecialWords.Processed.txt', 'w') as file_to_write:
    with open('SpecialWords.txt') as file_to_read:
        for line in file_to_read:
            if(line.rstrip() in wordsAlreadySeen):
                continue
            if(len(line.rstrip()) > 4):
                totalNumberOfWords += 1
                processedLine = ''
                for c in line.rstrip():
                    processedLine += c + ". "
                print (processedLine)
                file_to_write.write(processedLine.strip() + '\n')
                wordsAlreadySeen.add(line.rstrip())
            if(totalNumberOfWords > 4950):
                break

print (totalNumberOfWords)



