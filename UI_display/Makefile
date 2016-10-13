CC := gcc
CFLAGS := -c -w -g -fno-exceptions -ffunction-sections -fdata-sections -fno-threadsafe-statics -O1 -DARDUINO=158 -D_86DUINO=210
LINK_FLAGS := -w -Wl,--gc-sections -O1
86DUINO_DIR := /home/dmp/86Duino_Linux_SDK
SDL_DIR := /usr/local/include/SDL
SOCKET_DIR := /home/dmp/UI_display

LIB_PATH := $(86DUINO_DIR)/cores
LIB_INCLUDE := -I$(86DUINO_DIR)/cores
SDL_INCLUDE := -I$(SDL_DIR)/
SOCKET_INCLUDE := -I$(SOCKET_DIR)/include
LIB := libcore.a
INIT_OBJS := 86Duino_Init.o

THIRD_LIB_NAME := 
THIRD_LIB_INCLUDE := $(addprefix -I$(86DUINO_DIR)/libraries/,$(THIRD_LIB_NAME))
THIRD_LIB_PATH := $(addprefix -L$(86DUINO_DIR)/libraries/,$(THIRD_LIB_NAME))
THIRD_LIB := $(addprefix -l,$(THIRD_LIB_NAME))
SDL_LIB_INCLUDE := $(addprefix -I$(SDL_DIR)/,$(THIRD_LIB_NAME))
SOCKET_LIB_INCLUDE := $(addprefix -I$(SOCKET_DIR)/include/,$(THIRD_LIB_NAME))
SOCKET_LIB_PATH := $(addprefix -L$(SOCKET_DIR)/lib/Release/,$(THIRD_LIB_NAME))
EXTEN_LIB := -lSDL -lSDL_image -lSDL_ttf -lSDL_gfx -lboost_date_time-mt -lboost_random-mt -lboost_system-mt -lsioclient -lsioclient_tls


SRCS := $(wildcard *.cpp)
OBJS := $(patsubst %cpp,%o,$(SRCS))
TARGETS := UI_display

.PHONY : everything clean all $(LIB)

everything: $(LIB) $(TARGETS)

clean:
	rm $(OBJS) $(TARGETS)

all: clean everything

$(LIB):
	make -C $(LIB_PATH)

$(TARGETS): $(OBJS) $(LIB_PATH)/$(LIB) $(LIB_PATH)/$(INIT_OBJS)
	$(CC) $(LINK_FLAGS) -Wl,--start-group $^ $(THIRD_LIB) $(EXTEN_LIB) -Wl,--end-group -o $@ $(THIRD_LIB_PATH)  -L ~/UI_display/lib/Release  -lstdc++ -pthread -lrt -lboost_system -std=c++11


%.o: %.cpp
	$(CC) $(CFLAGS) $< -o $@ $(LIB_INCLUDE) $(THIRD_LIB_INCLUDE) $(SDL_INCLUDE) $(SDL_LIB_INCLUDE) $(SOCKET_INCLUDE) $(SOCKET_LIB_INCLUDE) -lboost_system -lpthread -lboost_thread -lrt -std=c++11



