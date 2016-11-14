CC := gcc
CFLAGS := -c -w -g -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -O1 -DARDUINO=158 -D_86DUINO=210
LINK_FLAGS := -w -Wl,--gc-sections -O1
86DUINO_DIR := /home/dmp/86Duino_Linux_SDK
THIS_DIR := /home/dmp/TFT_display

LIB_PATH := $(86DUINO_DIR)/cores
LIB_INCLUDE := -I$(86DUINO_DIR)/cores
SOCKET_INCLUDE := -I$(THIS_DIR)/include/socketIO
LIB := libcore.a
INIT_OBJS := 86Duino_Init.o


TFT_LIB_NAME := TFT
TFT_LIB_INCLUDE := $(addprefix -I$(86DUINO_DIR)/libraries/,$(TFT_LIB_NAME))
TFT_LIB_UTILITY := $(addprefix -I$(86DUINO_DIR)/libraries/,$(TFT_LIB_NAME)/utility)
TFT_LIB_PATH := $(addprefix -L$(86DUINO_DIR)/libraries/,$(TFT_LIB_NAME))

SPI_LIB_NAME := SPI
SPI_LIB_INCLUDE := $(addprefix -I$(86DUINO_DIR)/libraries/,$(SPI_LIB_NAME))
SPI_LIB_UTILITY := $(addprefix -I$(86DUINO_DIR)/libraries/,$(SPI_LIB_NAME)/utility)
SPI_LIB_PATH := $(addprefix -L$(86DUINO_DIR)/libraries/,$(SPI_LIB_NAME))

THIRD_LIB := $(addprefix -l,$(TFT_LIB_NAME)) $(addprefix -l,$(SPI_LIB_NAME))

EXTEN_LIB := -lboost_date_time-mt -lsioclient -lsioclient_tls


SRCS := $(wildcard *.cpp)
OBJS := $(patsubst %cpp,%o,$(SRCS))
TARGETS := TFT_display

.PHONY : everything clean all $(LIB)

everything: $(LIB) $(TARGETS)

clean:
	rm $(OBJS) $(TARGETS)

all: clean everything

$(LIB):
	make -C $(LIB_PATH)

$(TARGETS): $(OBJS) $(LIB_PATH)/$(LIB) $(LIB_PATH)/$(INIT_OBJS)
	$(CC) $(LINK_FLAGS) -Wl,--start-group $^ $(THIRD_LIB) $(EXTEN_LIB) -Wl,--end-group -o $@ $(TFT_LIB_PATH) $(SPI_LIB_PATH) -L ~/TFT_display/lib/Release  -lstdc++ -pthread -lrt -lboost_system -std=c++11

%.o: %.cpp
	$(CC) $(CFLAGS) $< -o $@ $(LIB_INCLUDE) $(TFT_LIB_INCLUDE) $(TFT_LIB_UTILITY) $(SPI_LIB_INCLUDE) $(SPI_LIB_UTILITY) $(SOCKET_INCLUDE) -lboost_system -lpthread -lboost_thread -lrt -std=c++11




