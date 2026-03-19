# Define the TikZ diagram files
DIAGRAMS = fft_butterfly

# Default target
all: $(DIAGRAMS:=.png)

# Rule to convert .tex to .png using pdflatex and ImageMagick's convert
%.png: %.tex
	pdflatex $<
	convert -density 300 $(basename $<).pdf -quality 90 $@

# Clean up intermediate files
clean:
	rm -f *.aux *.log *.pdf *.png

.PHONY: all clean
