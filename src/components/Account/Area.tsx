import { Box, Flex, IconButton, Popover, Stack, useDisclosure } from '@chakra-ui/react';  
import { useEffect, useState } from 'react'  
  
import { FiCompass, FiGripVertical } from 'react-icons/fi';  
import Module from "./Module"  
import { ModuleResponse } from '@interfaces/Module';  
import { Skeleton } from '../../components/ui/skeleton';  
import Toc from "./Toc"  
import { getAccountConfig, putAccountModuleOrder } from '@api/Account'  
import { keyframes } from '@emotion/react'  
import { toaster } from '../../components/ui/toaster'  
  
interface AreaProps {  
    alias: string,  
    keys: string  
}  
  
export interface TocItem {  
    name: string,  
    id: string  
}  
  
export default function Area({ alias, keys: key }: AreaProps) {  
  
    const [config, setConfig] = useState<ModuleResponse | null>(null);  
    const { open, onOpen, onClose } = useDisclosure()  
    const [draggedModule, setDraggedModule] = useState<string | null>(null);  
    const [moduleOrder, setModuleOrder] = useState<string[]>([]);  
  
    useEffect(() => {  
        if (alias && key) {  
            getAccountConfig(alias, key).then((res) => {  
                setConfig(res)  
            }).catch((err) => {  
                console.log(err);  
            })  
        }  
    }, [alias, key]);  
  
    useEffect(() => {  
        if (config?.order) {  
            setModuleOrder(config.order);  
        }  
    }, [config]);  
  
    const moveModule = (fromIndex: number, toIndex: number) => {  
        if (fromIndex === toIndex) return;  
  
        const newOrder = [...moduleOrder];  
        const [movedModule] = newOrder.splice(fromIndex, 1);  
        newOrder.splice(toIndex, 0, movedModule);  
  
        setModuleOrder(newOrder);  
    };  
  
    const handleDragStart = (moduleId: string) => {  
        setDraggedModule(moduleId);  
    };  
  
    const handleDragEnd = () => {  
        setDraggedModule(null);  
        saveModuleOrder();  
    };  
  
    const handleDragOver = (e: React.DragEvent) => {  
        e.preventDefault();  
    };  
  
    const handleDrop = (e: React.DragEvent, targetIndex: number) => {  
        e.preventDefault();  
        if (draggedModule === null) return;  
  
        const sourceIndex = moduleOrder.indexOf(draggedModule);  
        if (sourceIndex !== -1) {  
            moveModule(sourceIndex, targetIndex);  
        }  
    };  
  
    const saveModuleOrder = async () => {  
        try {  
            await putAccountModuleOrder(alias, key, moduleOrder);  
            toaster.create({ type: 'success', title: '保存成功', description: '模块顺序已更新' });  
        } catch (err) {  
            toaster.create({ type: 'error', title: '保存失败', description: '网络错误' });  
        }  
    };  
  
    const tocList: TocItem[] = [];  
    moduleOrder.map((module) => {  
        if (config?.info[module]) {  
            tocList.push({ name: config.info[module].name, id: module })  
        }  
    })  
  
    const fade = keyframes`  
      from { opacity: 0; transform: translateY(20px); }  
      to { opacity: 1; transform: translateY(0); }  
    `  
  
    return (  
        <Box animation={`${fade} 0.5s ease-out`} pb={20}>  
            <Stack gap={4}>  
                {!config ? (  
                    Array.from({ length: 4 }).map((_, i) => (  
                        <Box key={i} p={6} borderWidth="1px" borderRadius="2xl" bg="bg.panel" shadow="sm">  
                            <Skeleton height="30px" width="40%" mb={4} />  
                             <Skeleton height="20px" width="100%" mb={2} />  
                             <Skeleton height="20px" width="80%" mb={2} />  
                             <Skeleton height="20px" width="90%" mb={6} />  
                             <Skeleton height="40px" width="100%" />  
                        </Box>  
                    ))  
                ) : (  
                    moduleOrder.map((module) => (  
                        <Module   
                            key={module}   
                            id={module}   
                            alias={alias}   
                            config={config?.config}   
                            info={(config.info[module])}   
                            isOpen={open}   
                            onOpen={onOpen}   
                            onClose={onClose}  
                            isDraggable={true}  
                            onDragStart={() => handleDragStart(module)}  
                            onDragEnd={handleDragEnd}  
                            onDragOver={handleDragOver}  
                            onDrop={(e) => handleDrop(e, moduleOrder.indexOf(module))}  
                            isDragging={draggedModule === module}  
                        />  
                    ))  
                )}  
            </Stack>  
  
            {/* Floating TOC Button */}  
            <Flex position="fixed"  
                right="6"  
                top="50%"  
                transform="translateY(-50%)"  
                justifyContent="center"  
                alignItems="center"  
                 zIndex={100}  
            >  
                <Popover.Root lazyMount positioning={{ placement: 'left', gutter: 4 }}>  
                    <Popover.Trigger>  
                        <IconButton   
                            aria-label='TOC'  
                            colorPalette="blue"  
                            size="xl"  
                            rounded="full"  
                            shadow="xl"  
                            transition="all 0.2s"  
                            _hover={{ transform: "scale(1.1)", shadow: "2xl" }}  
                        >  
                            <FiCompass />  
                        </IconButton>  
                    </Popover.Trigger>  
                    <Popover.Content width="auto" minW="200px">  
                        <Toc maxH="60vh" tocList={tocList} />  
                    </Popover.Content>  
                </Popover.Root>  
            </Flex>  
        </Box>  
    )  
}